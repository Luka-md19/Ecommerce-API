const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const { sendResponse } = require('../utils/responseHelper');

// Delete a single document
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    sendResponse(res, 204, null);
  });

// Update a single document
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    sendResponse(res, 200, doc);
  });

// Create a single document
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    sendResponse(res, 201, doc);
  });

// Get a single document
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    sendResponse(res, 200, doc);
  });

// Get all documents with pagination and transformation support
exports.getAll = (Model, popOptions, transformFunc) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find();
    if (popOptions) query = query.populate(popOptions);

    // Use APIFeatures to handle filtering, sorting, field limiting, and pagination
    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the query
    const doc = await features.query;

    // Apply transformation if provided
    const results = transformFunc ? await Promise.all(doc.map(transformFunc)) : doc;

    // Pagination metadata
    const totalItems = await Model.countDocuments(features.query);  // Count total documents
    const currentPage = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const totalPages = Math.ceil(totalItems / limit);

    // Send the response using the helper
    sendResponse(res, 200, results, "success", {
      totalItems,
      totalPages,
      currentPage,
      limit
    });
  });
