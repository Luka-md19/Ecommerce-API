const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo('customer', 'admin'), 
    wishlistController.setUserId,
    wishlistController.createWishlist
  )
  .get(
    authController.restrictTo('customer', 'admin'),
    wishlistController.getWishlist 
  )
  .patch(
    authController.restrictTo('customer', 'admin'),
    wishlistController.updateWishlist
  );

// Route for deleting a specific product from the wishlist
router.delete('/:productId',
  authController.restrictTo('customer', 'admin'),
  wishlistController.deleteProductFromWishlist
);

module.exports = router;
