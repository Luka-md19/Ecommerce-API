const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

// Middleware to set req.params.id to the current user id
exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

// Update the currently logged-in user's data
exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user Posts Password Data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for updating passwords. Please use /updateMyPassword.', 400));
    }

    // 2) Filter out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

// Soft delete user by setting their "active" flag to false
exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// For admin users to create new users
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    });
};

// Get all users (Admin only)
exports.getAllUsers = factory.getAll(User);

// Get a specific user (Admin only)
exports.getUser = factory.getOne(User);

// Update user data (Admin only)
exports.updateUser = factory.updateOne(User);

// Delete a user (Admin only)
exports.deleteUser = factory.deleteOne(User);
