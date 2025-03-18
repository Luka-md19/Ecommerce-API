const express = require('express');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for authenticated users
router
  .route('/')
  .get(orderController.getMyOrders)  // Get orders for the logged-in user
  .post(orderController.createOrder);  // Create a new order

// Routes for users to get or update an order
router
  .route('/:id')
  .get(orderController.getOrder)  // Get a specific order by ID
  .patch(authController.restrictTo('admin'), orderController.updateOrderStatus);  // Admin: Update order status

// User route to initiate a return on an order
router.post('/:orderId/initiate-return', orderController.initiateReturn);

// // User route to track return shipments
// router.get('/track-return/:trackingNumber', orderController.trackReturnShipment);

// Admin/store staff route for processing in-store returns
router.post(
  '/:id/in-store-return',
  authController.restrictTo('admin', 'store_staff'),
  orderController.processInStoreReturn
);

// Admin-only routes
router.use(authController.restrictTo('admin'));

// Admin: Get all orders
router
  .route('/admin/all')
  .get(orderController.getAllOrders);

// Admin: Mark an order as shipped
router
  .route('/:id/mark-shipped')
  .patch(orderController.markAsShipped);

module.exports = router;
