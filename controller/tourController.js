const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const errorApp = require('../utils/errApp');
const factory = require('./factoryHandler');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new errorApp('Please upload image exactly once'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
// mix upload file for 1 or many file in form_data
exports.uploadImagesTour = upload.fields([
  {
    name: 'images',
    maxCount: 3,
  },
  {
    name: 'imageCover',
    maxCount: 1,
  },
]);

exports.resizeImagesTour = catchAsync(async (req, res, next) => {
  // console.log(req.files);
  if (req.files.imageCover) {
    req.body.imageCover = `user-${req.user.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 100 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, index) => {
        const filenameImage = `user-${req.user.id}-${Date.now()}-${
          index + 1
        }.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 100 })
          .toFile(`public/img/tours/${filenameImage}`);
        req.body.images.push(filenameImage);
      }),
    );
  }
  next();
});
exports.aliasTop = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-raitingAvarages';
  req.query.fields = 'name,difficulty,price,raitingAvarages';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTours = factory.getOne(Tour, {
  path: 'review',
});
exports.createTour = factory.createOne(Tour);
exports.deleteTours = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);

// /tours-within/:distance/center/:latlng/unit/:unit

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const [lat, long] = latlng.split(',');

  if (!lat || !long) {
    return next(new errorApp('please provide a lat and long', 400));
  }

  const tour = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[long, lat], radius] },
    },
  });

  return res.status(200).json({
    status: 'success',
    result: tour.length,
    data: {
      data: tour,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  const multiplier = unit === 'mi' ? 0.000621371192 : 0.001;

  const [lat, long] = latlng.split(',');

  if (!lat || !long) {
    return next(new errorApp('please provide a lat and long', 400));
  }

  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [long * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  return res.status(200).json({
    data: {
      data: distance,
    },
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        raitingAvarages: { $gte: 7 },
      },
    },
    {
      $group: {
        _id: null,
        numTour: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$raitingAvarages' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);
  if (!stats) {
    return next(new errorApp('do not have data stats', 404));
  }
  return res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-30`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTour: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: {
        monthTour: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { monthTour: 1 },
    },
  ]);
  if (!plan) return next(new errorApp('do not have data ', 404));
  return res.status(200).json({
    status: 'success',
    data: { plan },
  });
});
