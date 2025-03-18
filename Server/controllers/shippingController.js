// File Path: /controllers/shippingController.js

const shippingService = require('../services/shippingService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendResponse } = require('../utils/responseHelper');
const logger = require('../utils/logger'); // Import the centralized logger

// Helper function to mask email addresses
const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  const maskedLocal = local.length > 2 ? local.slice(0, 2) + "***" : "***";
  return `${maskedLocal}@${domain}`;
};

// Route Handler to Create a Shipment
exports.createShipment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    logger.warn('Order ID not provided for shipment creation');
    return next(new AppError('Order ID is required', 400));
  }

  try {
    const shipment = await shippingService.createShipment(orderId);
    logger.info('Shipment created successfully', { orderId, trackingNumber: shipment.trackingNumber });

    sendResponse(res, 201, { trackingNumber: shipment.trackingNumber }, 'Shipment created successfully');
  } catch (err) {
    logger.error('Error creating shipment', { error: err.message });
    next(new AppError(err.message, err.statusCode || 500));
  }
});

// Route Handler to Update Shipment Status
exports.updateShipmentStatus = catchAsync(async (req, res, next) => {
  const { trackingNumber } = req.params;
  const { status } = req.body;

  if (!status) {
    logger.warn(`Status not provided for updating shipment: ${trackingNumber}`);
    return next(new AppError('New status is required', 400));
  }

  logger.info(`Updating status for shipment: ${trackingNumber} to ${status}`, { trackingNumber, status });

  try {
    const shipment = await shippingService.updateShipmentStatus(trackingNumber, status);
    logger.info(`Shipment status updated: ${trackingNumber} -> ${status}`, { trackingNumber, status });

    sendResponse(res, 200, { shipment }, 'Shipment status updated successfully');
  } catch (err) {
    logger.error(`Error updating shipment status: ${err.message}`, { error: err });
    next(new AppError(err.message, err.statusCode || 500));
  }
});

// Route Handler to Track Shipment
exports.trackShipment = catchAsync(async (req, res, next) => {
  const { trackingNumber } = req.params;

  logger.info(`Tracking shipment for tracking number: ${trackingNumber}`, { trackingNumber });

  try {
    const shipment = await shippingService.trackShipment(trackingNumber);
    logger.info(`Shipment details retrieved for: ${trackingNumber}`, { trackingNumber, status: shipment.status });

    // Optionally mask user email before sending in response
    const user = shipment.orderId.userId;
    const maskedEmail = maskEmail(user.email);

    sendResponse(res, 200, { 
      shipment: {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        estimatedDeliveryDate: shipment.estimatedDeliveryDate,
        lastUpdated: shipment.lastUpdated,
        order: {
          orderId: shipment.orderId._id,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: maskedEmail,
          },
        },
      }
    }, 'Shipment details retrieved successfully');
  } catch (err) {
    logger.error(`Error tracking shipment: ${err.message}`, { error: err });
    next(new AppError(err.message, 404));
  }
});
