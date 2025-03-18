const Shipping = require('../models/shippingModel');
const Order = require('../models/orderModel');
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');
const crypto = require('crypto');

// Helper function to verify Shippo webhook signatures
const verifyShippoWebhook = (payload, signature) => {
  const computedSignature = crypto.createHmac('sha256', process.env.SHIPPO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
};

exports.handleShippoWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers['shippo-signature'];
  const payload = req.body;

  // Verify webhook signature
  if (!verifyShippoWebhook(payload, signature)) {
    logger.warn('Invalid Shippo webhook signature');
    return next(new AppError('Invalid signature', 401));
  }

  const event = JSON.parse(payload);
  const { tracking_number, status } = event;

  // Find the shipment by tracking number
  const shipment = await Shipping.findOne({ trackingNumber: tracking_number });
  if (!shipment) {
    logger.error(`Shipment not found for tracking number: ${tracking_number}`);
    return res.status(404).json({ status: 'fail', message: 'Shipment not found' });
  }

  // Update shipment status
  shipment.status = status;
  await shipment.save();

  // Update order status based on shipment status
  const order = await Order.findById(shipment.orderId).populate('userId');
  if (status === 'DELIVERED') {
    order.status = 'delivered';
    await order.save();

    // Send notification to the user
    await notificationService.sendOrderNotification(order, 'delivered');
    logger.info(`Delivered notification sent for order ${order._id}`);
  }

  res.status(200).json({ status: 'success' });
});
