const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A product must have a name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'A product must have a description'],
  },
  price: {
    type: Number,
    required: [true, 'A product must have a price'],
  },
  categories: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'A product must belong to at least one category'],
    },
  ],
  inventoryCount: {
    type: Number,
    required: [true, 'A product must have an inventory count'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, 
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual populate for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'productId',
  localField: '_id',
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
