const Address = require('../models/addressModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const { handleDefaultAddress } = require('../utils/addressUtils');

// Middleware to set the userId from the URL params
exports.setUserId = (req, res, next) => {
  if (!req.body.userId) req.body.userId = req.params.userId;
  next();
};

// Create a new address
exports.createAddress = catchAsync(async (req, res, next) => {
  const { userId, isDefault } = req.body;

  // Handle the default address logic
  await handleDefaultAddress(userId, isDefault);

  // Use the factory to create a new address
  const newAddress = await factory.createOne(Address)(req, res, next);
  return newAddress; // Pass the new address to the response
});

// Get all addresses for a user
exports.getAllAddresses = factory.getAll(Address);

// Get a single address
exports.getAddress = factory.getOne(Address);

// Update an address
exports.updateAddress = catchAsync(async (req, res, next) => {
  const { isDefault } = req.body;

  // Handle the default address logic
  await handleDefaultAddress(req.user._id, isDefault);

  // Use the factory to update the address
  const updatedAddress = await factory.updateOne(Address)(req, res, next);
  return updatedAddress; // Pass the updated address to the response
});

// Delete an address
exports.deleteAddress = factory.deleteOne(Address);
