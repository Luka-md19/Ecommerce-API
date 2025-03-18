const orderService = require('../services/orderService');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Order = require('../models/orderModel');
const { createReturnShipment } = require('../services/orderService');
const Shipping = require('../models/shippingModel');
const notificationService = require('../services/notificationService');

// Create a new order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { products, shippingAddress } = req.body;

  try {
    // Delegate business logic to orderService
    const order = await orderService.createOrder(req.user._id, products, shippingAddress);

    // Send transformed response
    res.status(201).json({
      status: 'success',
      data: { order: orderService.transformOrderResponse(order) },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
});

// Get a single order by ID
exports.getOrder = factory.getOne(Order, ['products.product', 'shippingAddress'], orderService.transformOrderResponse);

// Get all orders for the logged-in user
exports.getMyOrders = factory.getAll(Order, ['products.product', 'shippingAddress'], orderService.transformOrderResponse);

// Admin: Get all orders
exports.getAllOrders = factory.getAll(Order, ['products.product', 'shippingAddress'], orderService.transformOrderResponse);

// Update order status (e.g., to processing, shipped, delivered, etc.)
exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  try {
    // Update order status in orderService
    const order = await orderService.updateOrderStatus(req.params.id, status);

    // Send transformed response
    res.status(200).json({
      status: 'success',
      data: { order: orderService.transformOrderResponse(order) },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
});

// Mark an order as shipped
exports.markAsShipped = catchAsync(async (req, res, next) => {
  try {
    // Use the updated shippingService to create a shipment
    const trackingNumber = await shippingService.createShipment(req.params.id);
    
    // Optionally, update additional order or shipping details if necessary

    // Send transformed response
    res.status(200).json({
      status: 'success',
      message: 'Order marked as shipped',
      trackingNumber: trackingNumber,
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
});
exports.processInStoreReturn = catchAsync(async (req, res, next) => {
  // Log the entire request body to debug
  console.log('Received request body in controller:', req.body);

  const { proofOfPurchase } = req.body;

  // Log the value of proofOfPurchase
  console.log('Proof of Purchase:', proofOfPurchase);

  if (!proofOfPurchase || typeof proofOfPurchase !== 'string') {
    return next(new AppError('Proof of purchase is required and must be a valid string', 400));
  }

  try {
    const order = await orderService.processInStoreReturn(proofOfPurchase);

    res.status(200).json({
      status: 'success',
      message: 'Order marked as returned and refund processed',
      data: { order: orderService.transformOrderResponse(order) },
    });
  } catch (err) {
    next(new AppError(err.message, 400));
  }
});


// Initiate return process
// Initiate return process
exports.initiateReturn = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId).populate('products.product');
  if (!order) return next(new AppError('Order not found', 404));

  if (order.status !== 'delivered') {
    return next(new AppError('Only delivered orders can be returned', 400));
  }

  if (order.paymentStatus !== 'paid') {
    return next(new AppError('Cannot process return for an unpaid order', 400));
  }

  // Create a return shipment via the mock shipping API
  const returnTrackingNumber = await createReturnShipment(order._id);

  // Create a new shipment document for the return
  await Shipping.create({
    orderId: order._id,
    trackingNumber: returnTrackingNumber,
    status: 'return_initiated',
    type: 'return',
  });

  // Update the order status to 'return_initiated'
  order.status = 'return_initiated';
  await order.save();

  // Send notification to the user
  await notificationService.sendOrderNotification(order, 'return_initiated');

  res.status(200).json({
    status: 'success',
    message: 'Return initiated, return shipment created',
    trackingNumber: returnTrackingNumber,
  });
});



// // Helper function to track return shipment status
// exports.trackReturnShipment = catchAsync(async (req, res, next) => {
//   const { trackingNumber } = req.params;

//   console.log(`Tracking return shipment for tracking number: ${trackingNumber}`); 

//   try {
//     const response = await axios.get(`http://localhost:5001/shipping/track-return/${trackingNumber}`);
//     res.status(200).json({
//       status: 'success',
//       shipmentStatus: response.data.status,
//     });
//   } catch (err) {
//     console.error(`Failed to track return shipment for ${trackingNumber}: ${err.message}`); 
//     return next(new AppError('Failed to track return shipment', 500));
//   }
// });


