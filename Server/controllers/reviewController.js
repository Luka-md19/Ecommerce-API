const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
const reviewService = require('../services/reviewService');

// Middleware to set productId and userId for nested routes
exports.setProductUserIds = (req, res, next) => {
  if (!req.body.productId) req.body.productId = req.params.productId;
  if (!req.body.userId) req.body.userId = req.user.id;
  next();
};

// Create a review
exports.createReview = factory.createOne(Review);
// Get a single review
exports.getReview = factory.getOne(Review);
// Get all reviews (optionally filtered by product)
exports.getAllReviews = factory.getAll(Review);
// Update a review
exports.updateReview = factory.updateOne(Review);
// Delete a review
exports.deleteReview = factory.deleteOne(Review);
