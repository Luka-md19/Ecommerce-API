// File Path: /models/shippingModel.js

const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Shipment must be associated with an order'],
  },
  courierId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false, // Optional: Assign couriers as per internal logic
  },  
  trackingNumber: {
    type: String,
    required: [true, 'Tracking number is required'],
    unique: true,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'courier_assigned',
      'shipped',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'return_initiated',
      'collected',
      'returned_to_store',
      'exception',
    ],
    default: 'pending',
  },
  type: {
    type: String,
    enum: ['delivery', 'return'],
    default: 'delivery',
  },
  estimatedDeliveryDate: {
    type: Date,
    required: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

shippingSchema.index({ trackingNumber: 1, orderId: 1 });
shippingSchema.index({ courierId: 1 });
shippingSchema.index({ status: 1 });

const Shipping = mongoose.model('Shipping', shippingSchema);

module.exports = Shipping;
