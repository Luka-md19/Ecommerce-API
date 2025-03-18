// File Path: /controllers/paymentController.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');
const Shipping = require('../models/shippingModel');
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const EventLog = require('../models/eventLogModel');
const shippingService = require('../services/shippingService');

// Create Payment Intent
exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  logger.info('Received request to create payment intent', { orderId });

  // Find the order
  const order = await Order.findById(orderId);
  if (!order) {
    logger.error('Order not found', { orderId });
    return next(new AppError('Order not found', 404));
  }

  logger.info('Order found', { orderId: order._id, totalAmount: order.totalAmount });

  // Create a payment intent with Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // Amount in cents
    currency: 'usd',
    metadata: { orderId: order._id.toString() },
    automatic_payment_methods: { enabled: true },
  });

  logger.info('Payment intent created', { paymentIntentId: paymentIntent.id });

  // Update the order with the paymentIntentId and initial payment status
  order.paymentIntentId = paymentIntent.id;
  order.stripePaymentIntentStatus = paymentIntent.status; // Store Stripe's Payment Intent status
  order.paymentStatus = 'unpaid'; // Ensure paymentStatus is set to 'unpaid' initially
  await order.save();

  logger.info('Order updated with paymentIntentId and stripePaymentIntentStatus', {
    orderId: order._id,
    paymentIntentId: paymentIntent.id,
    stripePaymentIntentStatus: paymentIntent.status,
  });

  res.status(200).json({
    status: 'success',
    clientSecret: paymentIntent.client_secret,
  });
});

// Stripe webhook for handling payment events
exports.handleWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    logger.info('Stripe webhook received', { eventType: event.type, eventId: event.id });
  } catch (err) {
    logger.error('Stripe Webhook Error', { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency check
  const existingEvent = await EventLog.findOne({ eventId: event.id });
  if (existingEvent) {
    logger.info('Stripe event already processed', { eventId: event.id });
    return res.status(200).json({ received: true });
  }

  // Event Handlers Mapping
  const eventHandlers = {
    'payment_intent.created': handlePaymentIntentCreated,
    'payment_intent.succeeded': (data) => handlePaymentStatus(data, 'paid'),
    'charge.succeeded': handleChargeSucceeded,
    'charge.updated': handleChargeUpdated,
    'refund.succeeded': handleRefund,
    // Add other event handlers here
  };

  const handler = eventHandlers[event.type];
  if (handler) {
    try {
      await handler(event.data.object);
    } catch (err) {
      logger.error('Error handling Stripe event', { eventType: event.type, error: err.message });
      // Optionally, you might choose to not acknowledge the webhook to retry
      return res.status(500).send(`Error handling event: ${err.message}`);
    }
  } else {
    logger.warn('Unhandled Stripe event type', { eventType: event.type });
  }

  // Log the event as processed
  await EventLog.create({ eventId: event.id, createdAt: new Date(event.created * 1000) });

  res.status(200).json({ received: true });
});

// Handler for 'payment_intent.created' event
async function handlePaymentIntentCreated(paymentIntent) {
  const order = await Order.findById(paymentIntent.metadata.orderId).populate('userId');

  if (!order) {
    logger.error('Order not found for Payment Intent', { orderId: paymentIntent.metadata.orderId });
    return;
  }

  // Initialize or update order status as needed
  order.paymentStatus = 'payment_intent_created';
  await order.save();

  logger.info('Order paymentStatus initialized for Payment Intent creation', { orderId: order._id });

  // Optionally, send a notification to the user
  try {
    await notificationService.sendOrderNotification(order, 'payment_intent_created');
    logger.info('Payment Intent creation notification sent', { orderId: order._id });
  } catch (err) {
    logger.error('Error sending Payment Intent creation notification', { error: err.message });
  }
}

// Handler for 'charge.succeeded' event
async function handleChargeSucceeded(charge) {
  const paymentIntentId = charge.payment_intent;
  const order = await Order.findOne({ paymentIntentId }).populate('userId');

  if (!order) {
    logger.error('Order not found for charge succeeded', { paymentIntentId });
    return;
  }

  // Update Stripe's Charge status
  order.stripeChargeStatus = charge.status;

  // Update the order's payment status based on charge status
  if (charge.status === 'succeeded') {
    order.paymentStatus = 'paid';
  } else {
    order.paymentStatus = 'unpaid';
  }

  await order.save();

  logger.info('Order paymentStatus updated from charge succeeded', {
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    stripeChargeStatus: charge.status,
  });

  // Notify the user if necessary
  if (charge.status === 'succeeded') {
    try {
      await notificationService.sendOrderNotification(order, 'payment_successful');
      logger.info('Payment success notification sent', { orderId: order._id });
    } catch (err) {
      logger.error('Error sending payment success notification', { error: err.message });
    }
  }
}

// Helper function to handle payment status updates
async function handlePaymentStatus(paymentIntent, status) {
  const order = await Order.findById(paymentIntent.metadata.orderId).populate('userId');

  if (!order) {
    logger.error('Order not found for Payment Intent', { orderId: paymentIntent.metadata.orderId });
    return;
  }

  // Update Stripe's Payment Intent status
  order.stripePaymentIntentStatus = paymentIntent.status;

  // Update the order's payment status
  order.paymentStatus = status;
  await order.save();

  logger.info('Order paymentStatus updated', { orderId: order._id, paymentStatus: status });

  if (status === 'paid') {
    try {
      // Send the pending notification after payment success
      await notificationService.sendOrderNotification(order, 'pending');
      logger.info('Pending notification sent', { orderId: order._id });

      // Mark the order as processing
      order.status = 'processing';
      await order.save();

      logger.info('Order marked as processing', { orderId: order._id });

      // Notify user that their order is being processed
      await notificationService.sendOrderNotification(order, 'processing');
      logger.info('Processing email sent', { email: order.userId.email });

      // Try creating a shipment
      try {
        const shipment = await shippingService.createShipment(order._id); // Receive the shipment object
        const trackingNumber = shipment.trackingNumber;

        // Update the order with the tracking number and shipping reference
        order.trackingNumber = trackingNumber;
        order.shipping = shipment._id;
        await order.save();

        logger.info('Shipment created internally', { orderId: order._id, trackingNumber });
      } catch (err) {
        logger.error('Error creating shipment, no couriers available', { error: err.message });
        // Optionally notify the user that the shipment is pending
        await notificationService.sendOrderNotification(order, 'shipment_pending');
      }
    } catch (err) {
      logger.error('Error handling payment status', { error: err.message });
    }
  }
}

// Helper function to handle refund events
async function handleRefund(refund) {
  const order = await Order.findOne({ paymentIntentId: refund.payment_intent }).populate('userId');
  if (!order) {
    logger.error('Order not found for refund', { paymentIntentId: refund.payment_intent });
    return;
  }

  // Update Stripe's Refund status
  order.stripeRefundStatus = refund.status;

  // Update the order status to 'refund_completed'
  order.paymentStatus = 'refunded';
  order.status = 'refund_completed';
  await order.save();

  logger.info('Order refunded', { orderId: order._id, paymentStatus: 'refunded' });

  // Send a notification to the user about the refund completion
  try {
    await notificationService.sendOrderNotification(order, 'refund_completed');
    logger.info('Refund notification sent', { orderId: order._id });
  } catch (err) {
    logger.error('Error sending refund notification', { error: err.message });
  }
}

// Helper function to handle charge updated events
async function handleChargeUpdated(charge) {
  const paymentIntentId = charge.payment_intent;
  const order = await Order.findOne({ paymentIntentId }).populate('userId');

  if (!order) {
    logger.error('Order not found for charge update', { paymentIntentId });
    return;
  }

  // Assign the raw Stripe charge status to the stripeChargeStatus field
  order.stripeChargeStatus = charge.status;

  // Update the order's payment status based on your application's logic
  if (charge.status === 'succeeded') {
    order.paymentStatus = 'paid';
  } else if (['failed', 'canceled', 'expired'].includes(charge.status)) {
    order.paymentStatus = 'unpaid';
  } else if (charge.status === 'pending') {
    // Optionally handle 'pending' status
    order.paymentStatus = 'unpaid'; // Or add 'pending' to your enum if needed
  } else {
    // Handle other statuses if necessary
    order.paymentStatus = 'unpaid'; // Default or custom logic
  }

  await order.save();

  logger.info('Order paymentStatus updated from charge update', {
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    stripeChargeStatus: charge.status,
  });

  // Notify the user if necessary
  if (['failed', 'canceled', 'disputed'].includes(charge.status)) {
    try {
      await notificationService.sendOrderNotification(order, charge.status);
      logger.info('Notification sent for charge update', { orderId: order._id, status: charge.status });
    } catch (err) {
      logger.error('Error sending notification for charge update', { error: err.message });
    }
  }
}

// Exported function to process Stripe events (used by polling mechanism)
exports.processStripeEvent = async (event) => {
  // Idempotency check
  const existingEvent = await EventLog.findOne({ eventId: event.id });
  if (existingEvent) {
    logger.info('Stripe event already processed', { eventId: event.id });
    return;
  }

  // Event Handlers Mapping
  const eventHandlers = {
    'payment_intent.created': handlePaymentIntentCreated,
    'payment_intent.succeeded': (data) => handlePaymentStatus(data, 'paid'),
    'charge.succeeded': handleChargeSucceeded,
    'charge.updated': handleChargeUpdated,
    'refund.succeeded': handleRefund,
    // Add other event handlers here
  };

  const handler = eventHandlers[event.type];
  if (handler) {
    await handler(event.data.object);
  } else {
    logger.warn('Unhandled Stripe event type', { eventType: event.type });
  }

  // Log the event as processed
  await EventLog.create({ eventId: event.id, createdAt: new Date(event.created * 1000) });
};

// Export other functions as needed
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    logger.error('Order not found for cancellation', { orderId: id });
    return next(new AppError('Order not found', 404));
  }

  if (!order.isCancellable) {
    logger.warn('Order cannot be cancelled', { orderId: id });
    return next(new AppError('Order cannot be cancelled', 400));
  }

  // Update order status
  order.status = 'canceled';
  order.cancellationReason = req.body.reason || 'No reason provided';
  await order.save();

  logger.info('Order cancelled', { orderId: id, reason: order.cancellationReason });

  // Optionally, refund the payment if already paid
  if (order.paymentStatus === 'paid') {
    try {
      await stripe.refunds.create({ payment_intent: order.paymentIntentId });
      logger.info('Refund initiated for cancelled order', { orderId: id });
      order.paymentStatus = 'refund_initiated';
      await order.save();

      // Notify user about the refund
      await notificationService.sendOrderNotification(order, 'refund_initiated');
      logger.info('Refund initiation notification sent', { orderId: id });
    } catch (err) {
      logger.error('Error initiating refund for cancelled order', { error: err.message });
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Order has been cancelled successfully.',
  });
});
