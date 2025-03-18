const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A category must have a name'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  parentCategoryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
  },
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

// Virtual Population for products associated with this category
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categories',
});

// Virtual Population for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategoryId',
});

categorySchema.index({ name: 1 });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
