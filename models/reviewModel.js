//review / rating / createAt / ref tour / ref user
const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewShema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'must have review !'],
    },
    rating: { type: Number, min: 1, max: 5 },
    createAt: {
      type: Date,
      default: Date.now(),
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
      required: [true, 'review have to belong with user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review have to belong with tour'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
// reviewShema.index({ tour: 1, user: 1 }, { unique: true });
reviewShema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
reviewShema.statics.calculateRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      raitingAvarages: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      raitingAvarages: 4.5,
      ratingsQuantity: 0,
    });
  }
};
reviewShema.post('save', function () {
  this.constructor.calculateRating(this.tour);
});
reviewShema.post(/^findOneAnd/, async function (doc) {
  if (doc) {
    await doc.constructor.calculateRating(doc.tour);
  }
});
const review = mongoose.model('Review', reviewShema);
module.exports = review;
