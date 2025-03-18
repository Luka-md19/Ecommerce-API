const express = require('express');
const addressController = require('../controllers/addressController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .get(addressController.getAllAddresses)
  .post(
    authController.restrictTo('customer', 'admin'),
    addressController.setUserId,
    addressController.createAddress
  );

router
  .route('/:id')
  .get(addressController.getAddress)
  .patch(
    authController.restrictTo('customer', 'admin'), // Only customers and admins can update addresses
    addressController.updateAddress
  )
  .delete(
    authController.restrictTo('customer', 'admin'), // Only customers and admins can delete addresses
    addressController.deleteAddress
  );

module.exports = router;
