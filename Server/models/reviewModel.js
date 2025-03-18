const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // Linking the Review to the User who made it
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    
    // Linking the Review to the Product being reviewed
    productId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Review must be associated with a product'],
    },
    
    // Rating provided by the user, between 1 and 5
    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    
    // Optional comment provided by the user
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
    
    // Timestamp when the review was created
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Enables virtual properties (like average rating) to be included in output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure that one user can only submit one review per product (unique compound index)
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Pre-hook to populate user and product data when fetching reviews
reviewSchema.pre(/^find/, function (next) {
    this.populate({
      path: 'userId',
      select: 'firstName lastName', 
    });
    next();
  });
  

// Static method to calculate the average rating of a product after every new review
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { productId } },
    {
      $group: {
        _id: '$productId',
        numRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  // Update the product with the new calculated average and total number of reviews
  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: stats[0].numRatings,
      averageRating: stats[0].avgRating,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: 0,
      averageRating: 4.5, // Set default value
    });
  }
};

// Post-save hook to recalculate product ratings after every new review
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.productId);
});

// Post-remove hook to recalculate product ratings after a review is deleted
reviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.productId);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
