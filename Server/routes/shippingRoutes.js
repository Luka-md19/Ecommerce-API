// File Path: /routes/shippingRoutes.js

const express = require('express');
const shippingController = require('../controllers/shippingController');
const authController = require('../controllers/authController'); // Assuming you have authentication

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Only admins can create or update shipments
router.use(authController.restrictTo('admin'));

// Create a new shipment
router.post('/create', shippingController.createShipment);

// Update shipment status
router.patch('/:trackingNumber/status', shippingController.updateShipmentStatus);

// Track shipment status (accessible to authenticated users)
router.get('/track/:trackingNumber', shippingController.trackShipment);

module.exports = router;
