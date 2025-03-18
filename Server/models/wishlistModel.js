const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true, 
  },
  products: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Before saving, remove any duplicates in the products array
wishlistSchema.pre('save', function(next) {
  this.products = Array.from(new Set(this.products.map(String))); // Convert ObjectIds to strings for comparison
  next();
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
