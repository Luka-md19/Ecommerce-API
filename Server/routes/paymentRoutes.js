// File Path: /routes/paymentRoutes.js
const express = require('express');
const paymentController = require('../controllers/paymentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Stripe webhook for all payment events (no auth required, raw body needed)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Remove the refund-webhook route if it's no longer needed
// router.post('/refund-webhook', express.raw({ type: 'application/json' }), paymentController.handleRefundWebhook);

// Create a payment intent (protected)
router.post(
  '/create-payment-intent',
  authController.protect,
  authController.restrictTo('admin', 'customer'),
  paymentController.createPaymentIntent
);

// Cancel order (protected)
router.post('/cancel-order/:orderId', authController.protect, paymentController.cancelOrder);

module.exports = router;
