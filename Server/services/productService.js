const Product = require('../models/productModel');
const Review = require('../models/reviewModel');
const Category = require('../models/categoryModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');


// Fetch all products with filtering, sorting, pagination
exports.getAllProducts = async (filter, queryOptions) => {
  const features = new APIFeatures(Product.find(filter), queryOptions)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  return features.query.exec();
};

// Fetch a single product with reviews and category populated
exports.getProductById = async (productId) => {
  return Product.findById(productId).populate({
    path: 'categories',
    select: 'name'
  });
};

// Fetch reviews stats for a product
exports.getProductReviewStats = async (productId) => {
  return Review.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: '$productId',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);
};

// Transform product data for response
exports.formatProduct = async (product, reviewStats, reviews) => {
  const avgRating = reviewStats.length > 0 ? reviewStats[0].avgRating : 0;
  const numReviews = reviewStats.length > 0 ? reviewStats[0].numReviews : 0;

  return {
    id: product._id,
    name: product.name,
    description: product.description,
    price: product.price,
    categories: product.categories.map(category => ({
      id: category._id,
      name: category.name
    })),
    inventoryCount: product.inventoryCount,
    images: product.images,
    rating: avgRating,
    reviewsCount: numReviews,
    reviews: reviews.map(review => ({
      id: review._id,
      user: {
        id: review.userId._id,
        name: `${review.userId.firstName} ${review.userId.lastName}`
      },
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }))
  };
};

// Fetch reviews for a product
exports.getProductReviews = async (productId) => {
  return Review.find({ productId }).populate({
    path: 'userId',
    select: 'firstName lastName'
  });
};
exports.getProductsBySubcategory = async (subcategoryId) => {
  // Find products by the subcategory ID
  const products = await Product.find({ categories: subcategoryId }).populate({
    path: 'categories',
    select: 'name'
  });

  // Format the products to match the streamlined structure
  const formattedProducts = products.map(product => ({
    id: product._id,
    name: product.name,
    price: product.price,
    stock: product.inventoryCount,
    image: product.images[0], // First image or placeholder
    category: product.categories[0]?.name || 'Uncategorized', // Only take the first category name if available
  }));

  return formattedProducts;
};