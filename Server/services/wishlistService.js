const Wishlist = require('../models/wishlistModel');
const AppError = require('../utils/appError');

// Helper function to remove duplicates from product array
const removeDuplicates = (products) => {
  return Array.from(new Set(products.map((p) => p.toString())));
};

// Create a new wishlist
exports.createWishlist = async (userId, products) => {
  const existingWishlist = await Wishlist.findOne({ userId });
  if (existingWishlist) {
    throw new AppError('User already has a wishlist', 400);
  }

  const uniqueProducts = removeDuplicates(products);
  const wishlist = await Wishlist.create({ userId, products: uniqueProducts });

  return wishlist;
};

// Get wishlist by userId
exports.getWishlistByUserId = async (userId) => {
  const wishlist = await Wishlist.findOne({ userId }).populate({
    path: 'products',
    select: 'name images',
  });

  if (!wishlist) {
    throw new AppError('No wishlist found for this user', 404);
  }

  return wishlist;
};

// **New Function**: Get a formatted wishlist for the response
exports.getFormattedWishlist = (wishlist, user) => {
  return {
    id: wishlist._id,
    user: { id: wishlist.userId, name: `${user.firstName} ${user.lastName}` },
    products: wishlist.products.map((product) => ({
      id: product._id,
      name: product.name,
      imageUrls: product.images,
      detailsUrl: `/products/${product._id}`,
    })),
    createdAt: wishlist.createdAt,
  };
};

// Update wishlist by adding products and removing duplicates
exports.updateWishlist = async (userId, products) => {
  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    throw new AppError('No wishlist found for this user', 404);
  }

  wishlist.products.push(...products);
  wishlist.products = removeDuplicates(wishlist.products);

  await wishlist.save();

  return wishlist;
};

// Remove a specific product from the wishlist
exports.deleteProductFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    throw new AppError('No wishlist found for this user', 404);
  }

  const updatedProducts = wishlist.products.filter(
    (product) => product.toString() !== productId
  );

  if (updatedProducts.length === wishlist.products.length) {
    throw new AppError('Product not found in the wishlist', 404);
  }

  wishlist.products = updatedProducts;
  await wishlist.save();

  return wishlist;
};
