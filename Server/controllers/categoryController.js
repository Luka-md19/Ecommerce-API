const Category = require('../models/categoryModel');
const handlerFactory = require('./handlerFactory');
const categoryService = require('../services/categoryService');
// const cacheUtils = require('../utils/cacheUtils');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/responseHelper');



// Middleware for caching categories
// exports.cacheCategoryMiddleware = cacheUtils.cacheMiddleware('category');



// Get all categories (leveraging the handlerFactory)
exports.getAllCategories = handlerFactory.getAll(Category, null, categoryService.transformCategoryResponse);





// Get a single category with SEO metadata and caching
exports.getCategory = catchAsync(async (req, res, next) => {
  const category = await categoryService.findCategoryById(req.params.id);

  if (!category) {
    return next(new AppError('No category found with that ID', 404));
  }

  // Cache the category if found
  await cacheUtils.cacheCategory(`category:${req.params.id}`, category);

  // Transform the response and generate SEO metadata
  const response = categoryService.transformCategoryResponseWithMeta(category);

  sendResponse(res, 200, response);
});




// Get categories with their subcategories for sidebar
exports.getCategoriesWithSubcategories = catchAsync(async (req, res, next) => {
  const categories = await categoryService.findCategoriesWithSubcategories();

  if (!categories || categories.length === 0) {
    return next(new AppError('No categories found', 404));
  }

  sendResponse(res, 200, categories);
});




// Use the handlerFactory for create, update, and delete operations
exports.createCategory = handlerFactory.createOne(Category);
exports.updateCategory = handlerFactory.updateOne(Category);
exports.deleteCategory = handlerFactory.deleteOne(Category);
