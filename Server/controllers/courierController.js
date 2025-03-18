// File Path: /controllers/courierController.js

const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// Get all available couriers
exports.getAvailableCouriers = catchAsync(async (req, res, next) => {
  const couriers = await User.find({ role: 'courier', availabilityStatus: 'available' }).select('-password');

  res.status(200).json({
    status: 'success',
    results: couriers.length,
    data: { couriers },
  });
});

// Update courier availability
exports.updateCourierAvailability = catchAsync(async (req, res, next) => {
  const { courierId } = req.params;
  const { availabilityStatus } = req.body;

  if (!['available', 'unavailable'].includes(availabilityStatus)) {
    return next(new AppError('Invalid availability status', 400));
  }

  const courier = await User.findOneAndUpdate(
    { _id: courierId, role: 'courier' },
    { availabilityStatus },
    { new: true, runValidators: true }
  ).select('-password');

  if (!courier) {
    return next(new AppError('Courier not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { courier },
  });
});
