const Product = require('../models/productModel');
const handlerFactory = require('./handlerFactory');
const productService = require('../services/productService'); 
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
// const cacheUtils  = require('../utils/cacheUtils');



exports.setProductUserIds = (req, res, next) => {
  // Assign the current user ID (from the token) to the request body
  if (!req.body.user) req.body.user = req.user.id; 
  if (req.params.categoryId) req.body.category = req.params.categoryId;
  next();
};

// // Middleware for caching products
// exports.cacheProductMiddleware = cacheUtils.cacheMiddleware('product');

// Get all products
exports.getAllProducts = handlerFactory.getAll(Product, null, async (product) => {
  const reviewStats = await productService.getProductReviewStats(product._id);
  const reviews = await productService.getProductReviews(product._id);

  return productService.formatProduct(product, reviewStats, reviews);
});

// Get a single product
exports.getProduct = catchAsync(async (req, res, next) => {
  // Check Redis cache first
  const product = await productService.getProductById(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  const reviewStats = await productService.getProductReviewStats(product._id);
  const reviews = await productService.getProductReviews(product._id);

  const formattedProduct = await productService.formatProduct(product, reviewStats, reviews);

  // Cache the product if it's fetched
  await cacheUtils.cacheCategory(`product:${req.params.id}`, formattedProduct);

  res.status(200).json({
    status: 'success',
    data: {
      product: formattedProduct
    }
  });
});

// Get products by subcategory
exports.getProductsBySubcategory = catchAsync(async (req, res, next) => {
  // Fetch products from the service layer
  const products = await productService.getProductsBySubcategory(req.params.subcategoryId);

  // Handle case when no products are found
  if (!products.length) {
    return next(new AppError('No products found for this subcategory', 404));
  }

  // Return the response with the formatted products
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products
    }
  });
});


// Use handlerFactory for create, update, and delete operations
exports.createProduct = handlerFactory.createOne(Product);
exports.updateProduct = handlerFactory.updateOne(Product);
exports.deleteProduct = handlerFactory.deleteOne(Product);
