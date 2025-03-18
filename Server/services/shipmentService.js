// File Path: /services/shippingService.js

const Shipping = require('../models/shippingModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

// Helper function to assign a courier based on availability
const assignCourier = async (orderId) => {
  const query = { role: 'courier', availabilityStatus: 'available' };
  logger.info('Assigning courier with query parameters', query);
  
  const couriers = await User.find(query);
  
  logger.info('Available couriers returned', { count: couriers.length, courierIds: couriers.map(c => c._id) });

  if (!couriers || couriers.length === 0) {
    logger.warn('No available couriers found');
    
    // Notify administrators about the lack of available couriers
    await notificationService.notifyAdmin(`No available couriers to assign for order ID: ${orderId}`);

    throw new AppError('No available couriers found. Please try again later.', 500);
  }
  return couriers[0]._id;
};

// Generate a unique tracking number
const generateTrackingNumber = () => {
  return `SHIP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Create a new shipment
exports.createShipment = async (orderId) => {
  const order = await Order.findById(orderId).populate('userId');
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.status !== 'processing') {
    throw new AppError('Only processing orders can be shipped', 400);
  }

  let courierId;
  try {
    courierId = await assignCourier(orderId);
  } catch (err) {
    // Re-throw the error after logging and notification
    logger.error('Error assigning courier', { error: err.message });
    throw err;
  }

  const trackingNumber = generateTrackingNumber();

  // Calculate estimated delivery date (e.g., 5 days from now)
  const estimatedDeliveryDate = new Date();
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5);

  const shipment = await Shipping.create({
    orderId,
    courierId,
    trackingNumber,
    status: 'shipped',
    estimatedDeliveryDate,
  });

  // Update courier availability
  await User.findByIdAndUpdate(courierId, { availabilityStatus: 'unavailable' });

  // Update order with shipment details
  order.status = 'shipped';
  order.trackingNumber = trackingNumber;
  order.shipping = shipment._id;
  await order.save();

  // Notify user about the shipment
  await notificationService.sendOrderNotification(order, 'shipped');

  logger.info('Shipment created internally', { trackingNumber, courierId });

  return shipment; // Return the entire shipment object
};

// Update shipment status
exports.updateShipmentStatus = async (trackingNumber, newStatus) => {
  const shipment = await Shipping.findOne({ trackingNumber }).populate('orderId');
  if (!shipment) {
    throw new AppError('Shipment not found', 404);
  }

  // Define valid status transitions
  const validTransitions = {
    shipped: ['in_transit'],
    in_transit: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
    delivered: [],
    pending: ['courier_assigned', 'shipped'],
    courier_assigned: ['shipped'],
    return_initiated: ['collected', 'returned_to_store'],
    collected: ['return_initiated', 'returned_to_store'],
    returned_to_store: [],
    exception: ['in_transit', 'shipped'],
  };

  const currentStatus = shipment.status;

  if (!validTransitions[currentStatus].includes(newStatus)) {
    logger.warn(`Invalid status transition from ${currentStatus} to ${newStatus}`, { trackingNumber, currentStatus, newStatus });
    throw new AppError(`Cannot transition from ${currentStatus} to ${newStatus}`, 400);
  }

  shipment.status = newStatus;
  shipment.lastUpdated = Date.now();
  await shipment.save();

  logger.info('Shipment status updated', { trackingNumber, newStatus });

  // Handle specific status transitions
  if (newStatus === 'delivered') {
    // Update order status
    await Order.findByIdAndUpdate(shipment.orderId._id, { status: 'delivered' });

    // Update courier availability
    await User.findByIdAndUpdate(shipment.courierId, { availabilityStatus: 'available' });

    // Notify user about delivery
    await notificationService.sendOrderNotification(shipment.orderId, 'delivered');
  }

  return shipment;
};

// Track shipment
exports.trackShipment = async (trackingNumber) => {
  const shipment = await Shipping.findOne({ trackingNumber }).populate({
    path: 'orderId',
    populate: { path: 'userId' },
  });

  if (!shipment) {
    throw new AppError('Shipment not found', 404);
  }

  return shipment;
};

// Optional: Function to seed the database with sample couriers
exports.seedSampleCouriers = async () => {
  const sampleCouriers = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'courier', availabilityStatus: 'available' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'courier', availabilityStatus: 'available' },
    { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', role: 'courier', availabilityStatus: 'available' },
    // Add more sample couriers as needed
  ];

  for (const courierData of sampleCouriers) {
    const existingCourier = await User.findOne({ email: courierData.email });
    if (!existingCourier) {
      await User.create(courierData);
      logger.info('Sample courier created', { email: courierData.email });
    } else {
      logger.info('Sample courier already exists', { email: courierData.email });
    }
  }
};
