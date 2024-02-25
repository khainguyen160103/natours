const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tour: {
    type: mongoose.Types.ObjectId,
    ref: 'tour',
    require: [true, 'Must have tour'],
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
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

schema.pre(/^find/, function () {
  return this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });           
});

const model = mongoose.model('booking', schema);
module.exports = model;
