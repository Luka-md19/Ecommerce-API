// File Path: /routes/courierRoutes.js

const express = require('express');
const courierController = require('../controllers/courierController');
const authController = require('../controllers/authController'); // Assuming you have authentication

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Only admins can manage couriers
router.use(authController.restrictTo('admin'));

// Get all available couriers
router.get('/', courierController.getAvailableCouriers);

// Update courier availability
router.patch('/:courierId/availability', courierController.updateCourierAvailability);

module.exports = router;
