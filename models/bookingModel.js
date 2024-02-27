const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tour: {
    type: mongoose.Types.ObjectId,
    ref: 'Tour',
    require: [true, 'Must have tour'],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'Users',
    require: [true, 'Must have user'],
  },
  price: {
    type: Number,
    require: [true, 'Must have price'],
  },
  createAt: { type: Date, default: Date.now() },
  paid: {
    type: Boolean,
    default: true,
  },
});

schema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  }); 
  
  return next()
});

const Booking = mongoose.model('Booking', schema);
module.exports = Booking;
