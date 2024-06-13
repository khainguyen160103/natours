const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: 30,
    },
    slug: String,
    duration: {
      type: Number,
      require: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      require: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      require: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['difficult', 'easy', 'medium'],
        message: '{VALUE} is not suppport',
      },
    },
    raitingAvarages: {
      type: Number,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      min: 200,
      require: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return value < this.price;
        },
        message: '{VALUE} is not valid price',
      },
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      description: String,
      coordinates: [Number],
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        description: String,
        coordinates: [Number],
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
      },
    ],
    summary: {
      type: String,
      trim: true,
      require: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      require: [true, 'A tour must habe a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ slug: 1 });

tourSchema.virtual('durationOfWeek').get(function () {
  return this.duration / 7;
});
// virtual with review field ref to review model
tourSchema.virtual('review', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'tour',
  // match: { rating: { $ne: 5 } },
});
// console.log()

// middleware document
// tourSchema.pre('save', (next) => {
//   console.log(this);
//   next();
// });
tourSchema.pre('save', function (next) {
  // console.log('name document saved : ', this.name);
  this.slug = slugify(this.name, { lower: true });
  // console.log('slug : ', this.slug);
  next();
});

// middleware query
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangeAt',
  });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
//aggreagate middleware
// pipline() method use to get all the query with $ and return array contain all of this
tourSchema.pre('aggregate', function (next) {
  const query = this.pipeline()[0];
  if (Object.keys(query)[0] != '$geoNear') {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  }
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
