// File Path: /models/orderModel.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: [true, 'Product reference is required'],
        },
        quantity: {
          type: Number,
          required: [true, 'Product quantity is required'],
          min: [1, 'Quantity cannot be less than 1'],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Order must have a total amount'],
      min: [0, 'Total amount cannot be less than 0'],
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'canceled',
        'returned_to_store',
        'return_initiated',
        'refund_completed',
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'refunded', 'refund_initiated'],
      default: 'unpaid',
    },
    stripePaymentIntentStatus: {
      type: String, // Stores Stripe's Payment Intent status
      default: null,
    },
    stripeChargeStatus: {
      type: String, // Stores Stripe's Charge status
      default: null,
    },
    paymentIntentId: {
      type: String, 
    },
    shippingAddress: {
      type: mongoose.Schema.ObjectId,
      ref: 'Address',
      required: [true, 'Order must have a shipping address'],
    },
    trackingNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    isCancellable: {
      type: Boolean,
      default: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // Reference to Shipping model
    shipping: {
      type: mongoose.Schema.ObjectId,
      ref: 'Shipping',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes to improve query performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ trackingNumber: 1 }); // Index for trackingNumber

// Pre-save hooks
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (['canceled', 'delivered', 'refunded', 'refund_completed'].includes(this.status)) {
    this.isCancellable = false;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
