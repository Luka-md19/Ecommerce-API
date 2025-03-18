const Review = require('../models/reviewModel');
const redisClient = require('../utils/cacheUtils');
const AppError = require('../utils/appError');

// Helper function to format user details
const formatUserDetails = (user) => ({
  id: user._id,
  name: `${user.firstName} ${user.lastName}`,
});

// Function to create a review
exports.createReview = async (userId, productId, reviewData) => {
  // Check if the user has already reviewed the product
  const existingReview = await Review.findOne({ userId, productId });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Create a new review
  const review = await Review.create(reviewData);

  // Invalidate cache for the product's reviews
  await redisClient.del(`reviews:${productId}`);

  return review;
};

// Function to get all reviews with optional product filtering and caching
exports.getAllReviews = async (productId) => {
  const cacheKey = productId ? `reviews:${productId}` : 'reviews:all';

  // Check for cached reviews
  const cachedReviews = await redisClient.get(cacheKey);
  if (cachedReviews) {
    return JSON.parse(cachedReviews);
  }

  const filter = productId ? { productId } : {};
  const reviews = await Review.find(filter).populate('userId');

  // Format the reviews
  const formattedReviews = reviews.map((review) => ({
    user: formatUserDetails(review.userId),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  }));

  // Cache the reviews
  await redisClient.set(cacheKey, JSON.stringify(formattedReviews), 'EX', 3600);

  return formattedReviews;
};

// Function to get a single review by ID
exports.getReviewById = async (reviewId) => {
  const review = await Review.findById(reviewId).populate('userId');
  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }

  return {
    user: formatUserDetails(review.userId),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  };
};

// Function to update a review
exports.updateReview = async (reviewId, reviewData) => {
  const updatedReview = await Review.findByIdAndUpdate(reviewId, reviewData, {
    new: true,
    runValidators: true,
  });

  if (!updatedReview) {
    throw new AppError('No review found with that ID', 404);
  }

  // Invalidate cache for the product's reviews
  await redisClient.del(`reviews:${updatedReview.productId}`);

  return updatedReview;
};

// Function to delete a review
exports.deleteReview = async (reviewId) => {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    throw new AppError('No review found with that ID', 404);
  }

  // Invalidate cache for the product's reviews
  await redisClient.del(`reviews:${review.productId}`);

  return review;
};
