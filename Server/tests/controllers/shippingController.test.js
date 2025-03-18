// tests/controllers/shippingController.test.js

const shippingController = require('../../controllers/shippingController');
const shippingService = require('../../services/shippingService');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const { sendResponse } = require('../../utils/responseHelper');
const logger = require('../../utils/logger');

// Mock the dependencies
jest.mock('../../services/shippingService');
jest.mock('../../utils/catchAsync', () => (fn) => fn);
jest.mock('../../utils/responseHelper', () => ({
  sendResponse: jest.fn(),
}));
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Shipping Controller', () => {
  describe('createShipment', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        body: {
          orderId: 'order123',
        },
      };
      res = {};
      next = jest.fn();
      shippingService.createShipment.mockClear();
      sendResponse.mockClear();
      logger.info.mockClear();
      logger.error.mockClear();
    });

    it('should create a shipment successfully', async () => {
      // Arrange
      const mockTrackingNumber = 'TRACK123456';
      shippingService.createShipment.mockResolvedValue(mockTrackingNumber);

      // Act
      await shippingController.createShipment(req, res, next);

      // Assert
      expect(shippingService.createShipment).toHaveBeenCalledWith('order123');
      expect(logger.info).toHaveBeenCalledWith('Shipment created successfully', {
        orderId: 'order123',
        trackingNumber: mockTrackingNumber,
      });
      expect(sendResponse).toHaveBeenCalledWith(res, 201, { trackingNumber: mockTrackingNumber }, 'Shipment created successfully');
    });

    it('should return an error if orderId is missing', async () => {
      // Arrange
      req.body.orderId = undefined;

      // Act
      await shippingController.createShipment(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(new AppError('Order ID is required', 400));
      expect(shippingService.createShipment).not.toHaveBeenCalled();
      expect(sendResponse).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const mockError = new AppError('Service Error', 500);
      shippingService.createShipment.mockRejectedValue(mockError);

      // Act
      await shippingController.createShipment(req, res, next);

      // Assert
      expect(shippingService.createShipment).toHaveBeenCalledWith('order123');
      expect(logger.error).toHaveBeenCalledWith('Error creating shipment', { error: 'Service Error' });
      expect(next).toHaveBeenCalledWith(mockError);
      expect(sendResponse).not.toHaveBeenCalled();
    });
  });
});
