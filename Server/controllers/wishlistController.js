const wishlistService = require('../services/wishlistService');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/responseHelper');
const Wishlist = require('../models/wishlistModel');

// Middleware to set userId from params
exports.setUserId = (req, res, next) => {
  if (!req.body.userId) req.body.userId = req.params.userId;
  next();
};

// Create a new wishlist
exports.createWishlist = catchAsync(async (req, res, next) => {
  const { userId, products } = req.body;

  const wishlist = await wishlistService.createWishlist(userId, products);

  sendResponse(res, 201, { wishlist });
});

// Get the user's wishlist by userId
exports.getWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await wishlistService.getWishlistByUserId(req.params.userId);

  // Use the newly added `getFormattedWishlist` method from the service
  const formattedWishlist = wishlistService.getFormattedWishlist(wishlist, req.user);

  sendResponse(res, 200, { wishlist: formattedWishlist });
});
// Update a user's wishlist
exports.updateWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await wishlistService.updateWishlist(req.params.userId, req.body.products);

  sendResponse(res, 200, { wishlist });
});

// Delete a specific product from the user's wishlist
exports.deleteProductFromWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await wishlistService.deleteProductFromWishlist(req.params.userId, req.params.productId);

  sendResponse(res, 200, { wishlist });
});

// Delete an entire wishlist using the Handler Factory
exports.deleteWishlist = factory.deleteOne(Wishlist);
