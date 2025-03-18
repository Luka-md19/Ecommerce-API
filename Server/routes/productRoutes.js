const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes'); 

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(productController.getAllProducts)  // Public route
  .post(
    authController.protect,
    authController.restrictTo('admin', 'vendor'), // Only admin and vendor can create products
    productController.setProductUserIds,
    productController.createProduct
  );

router
  .route('/:id')
  .get(productController.getProduct)  // Public route
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'vendor'), // Only admin and vendor can update products
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),  // Only admin can delete products
    productController.deleteProduct
  );

// Nested route for reviews under products
router.use('/:productId/reviews', reviewRouter);  // Use the review routes under each product

module.exports = router;
