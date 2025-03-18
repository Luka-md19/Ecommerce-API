const express = require('express');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const productRouter = require('./productRoutes');

const router = express.Router({ mergeParams: true });

// Nested route to handle products under a category
router.use("/:categoryId/products", productRouter);

// New endpoint to get categories with subcategories
router.route('/with-subcategories')
  .get(categoryController.getCategoriesWithSubcategories);

router.route('/by-subcategory/:subcategoryId')
  .get(productController.getProductsBySubcategory);

router
  .route('/')
  .get(categoryController.getAllCategories)  // Public route
  .post(
    authController.protect,
    authController.restrictTo('admin', 'vendor'), // Only admin and vendor can create categories
    categoryController.createCategory
  );

router
  .route('/:id')
  .get(categoryController.getCategory)  // Public route
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'vendor'), // Only admin and vendor can update categories
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),  // Only admin can delete categories
    categoryController.deleteCategory
  );

module.exports = router;
