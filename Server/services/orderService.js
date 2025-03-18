// File Path: /services/orderService.js

const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Shipping = require('../models/shippingModel');
const User = require('../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AppError = require('../utils/appError');
const Address = require('../models/addressModel');
const notificationService = require('./notificationService');
const catchAsync = require('../utils/catchAsync');
const shippingService = require('./shippingService'); // Ensure correct path
const logger = require('../utils/logger');
const axios = require('axios'); // Make sure axios is installed

// Helper function to calculate the total amount for an order
const calculateTotalAmount = async (products) => {
  let totalAmount = 0;

  for (const item of products) {
    const product = await Product.findById(item.product).select('price');
    if (!product) {
      throw new AppError(`Product not found with ID ${item.product}`, 404);
    }

    const totalPrice = product.price * item.quantity;
    item.totalPrice = totalPrice.toFixed(2);  // Add calculated total price to product

    totalAmount += totalPrice;  // Accumulate total amount
  }

  return totalAmount;
};

// Helper function to format the shipping address
const formatShippingAddress = (address) => {
  if (!address) return 'No shipping address provided';
  return `${address.addressLine1}, ${address.addressLine2 || ''}, ${address.city}, ${address.state}, ${address.postalCode}, ${address.country}`;
};

// Helper function to get status label
const getStatusLabel = (status) => {
  const statuses = {
    pending: 'Pending Payment',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    canceled: 'Canceled',
    returned: 'Returned',
    return_initiated: 'Return Initiated',
    returned_to_store: 'Returned to Store',
    refund_completed: 'Refund Completed',
    // Add other statuses as needed
  };
  return statuses[status] || 'Unknown';
};

// Helper function to get shipping status label
const getShippingStatusLabel = (status) => {
  const statuses = {
    pending: 'Pending',
    courier_assigned: 'Courier Assigned',
    shipped: 'Shipped',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    return_initiated: 'Return Initiated',
    collected: 'Collected',
    returned_to_store: 'Returned to Store',
    exception: 'Exception',
  };
  return statuses[status] || 'Unknown';
};

// Helper function to get payment status label
const getPaymentStatusLabel = (paymentStatus) => {
  const statuses = {
    unpaid: 'Unpaid',
    paid: 'Paid',
    refunded: 'Refunded',
    refund_initiated: 'Refund Initiated',
  };
  return statuses[paymentStatus] || 'Unknown';
};

// Transform order response
const transformOrderResponse = (order, shipment) => ({
  orderId: order._id.toString(),
  totalAmount: order.totalAmount,
  status: {
    code: order.status,
    label: getStatusLabel(order.status),
  },
  shippingStatus: shipment
    ? {
        code: shipment.status,
        label: getShippingStatusLabel(shipment.status),
      }
    : {
        code: 'not_shipped',
        label: 'Not Shipped',
      },
  paymentStatus: {
    code: order.paymentStatus,
    label: getPaymentStatusLabel(order.paymentStatus),
  },
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
  shippingAddress: formatShippingAddress(order.shippingAddress),
  products: order.products.map((item) => ({
    productId: item.product._id.toString(),
    name: item.product.name,
    unitPrice: item.product.price,
    quantity: item.quantity,
    totalPrice: item.totalPrice,
    images: item.product.images,
  })),
});

// Create a new order
const createOrder = async (userId, products, shippingAddressId) => {
  if (!products || products.length === 0) {
    throw new AppError('No products in the order', 400);
  }

  const totalAmount = await calculateTotalAmount(products);
  const shippingAddress = await Address.findById(shippingAddressId);
  if (!shippingAddress) {
    throw new AppError('Shipping address not found', 404);
  }

  const order = await Order.create({
    userId,
    products,
    totalAmount,
    shippingAddress,
  });

  // Populate products in the order response
  await order.populate('products.product');

  return order;
};

// Fetch an order by ID with populated fields
const getOrderById = async (orderId) => {
  return Order.findById(orderId)
    .populate('products.product')
    .populate('shippingAddress');
};

// Handle updating the order status
const updateOrderStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('No order found with that ID', 404);
  }

  order.status = status;
  order.updatedAt = Date.now();
  await order.save();

  return order;
};

// Handle shipment of an order
const markAsShipped = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (['shipped', 'delivered'].includes(order.status)) {
    throw new AppError('Order is already shipped or delivered', 400);
  }

  await shippingService.createShipment(orderId);

  order.status = 'shipped';
  await order.save();

  return order;
};

// Process return for an in-store purchase
const processInStoreReturn = async (proofOfPurchase) => {
  logger.debug('Received Proof of Purchase:', proofOfPurchase);

  let order;

  // Determine how to find the order based on proofOfPurchase
  if (proofOfPurchase.match(/^[0-9a-fA-F]{24}$/)) {
    order = await Order.findById(proofOfPurchase).populate('products.product');
    logger.debug(`Order found by ID: ${proofOfPurchase}`);
  } else {
    const user = await User.findOne({ email: proofOfPurchase });
    if (user) {
      order = await Order.findOne({ userId: user._id }).populate('products.product').sort({ createdAt: -1 });
      logger.debug(`Order found by user email: ${user.email}`);
    } else {
      const shipment = await Shipping.findOne({ trackingNumber: proofOfPurchase });
      if (shipment) {
        order = await Order.findById(shipment.orderId).populate('products.product');
        logger.debug(`Order found by tracking number: ${shipment.trackingNumber}`);
      } else {
        throw new AppError('No valid proof of purchase found', 400);
      }
    }
  }

  if (!order) {
    logger.debug('Order not found during in-store return');
    throw new AppError('Order not found', 404);
  }

  // Validate order status and payment
  if (order.status !== 'delivered') {
    throw new AppError('Only delivered orders can be returned', 400);
  }

  if (order.paymentStatus !== 'paid') {
    throw new AppError('Cannot process return for an unpaid order', 400);
  }

  if (['refund_initiated', 'refunded'].includes(order.paymentStatus)) {
    throw new AppError('Refund already processed for this order', 400);
  }

  // Initiate refund via Stripe
  try {
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
    });

    logger.info(`Refund initiated for order: ${order._id}`);

    order.status = 'returned';
    order.paymentStatus = 'refund_initiated';
    await order.save();

    // Increase inventory for returned items
    for (const item of order.products) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.inventoryCount += item.quantity;
        await product.save();
        logger.debug(`Inventory updated for product: ${product._id}, Quantity Returned: ${item.quantity}`);
      }
    }

    // Send refund notification
    await notificationService.sendOrderNotification(order, 'refund_initiated');

    return order;
  } catch (err) {
    logger.error('Failed to process refund:', err.message);
    throw new AppError(`Failed to process refund: ${err.message}`, 500);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  updateOrderStatus,
  markAsShipped,
  processInStoreReturn,
  calculateTotalAmount,
  transformOrderResponse,
  getStatusLabel,
  getPaymentStatusLabel,
  getShippingStatusLabel,
};
