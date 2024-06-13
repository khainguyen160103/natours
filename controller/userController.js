const User = require('../models/userModel');
const ApiFeatures = require('../utils/apitFeatures');
const catchAsync = require('../utils/catchAsync');
const errApp = require('../utils/errApp');
const factory = require('./factoryHandler');
const multer = require('multer');
const sharp = require('sharp');

// const storage = multer.diskStorage({
//   // user-id-timestamp
//   destination: function (req, file, cb) {
//     cb(null, 'public/img/users');
//   },
//   filename: function (req, file, cb) {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// because input of sharp to resize is a buffer => using memoryStorage
const multerStorage = multer.memoryStorage();

// filter file if not a photo
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    // cb(message , false if error true otherwise)
    cb(null, true);
  } else {
    cb(new errApp('please upload the real file'), false);
  }
};
// config upload single file
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// filter fields for query : body is req.body , fields is fields that to be query
const filterObject = (body, ...fields) => {
  const newObj = {};
  for (const keys in body) {
    if (fields.includes(keys)) newObj[keys] = body[keys];
  }
  return newObj;
};

exports.uploadSingleImage = upload.single('photo');

// resize image if user upload big image
exports.resizeImage = catchAsync(async (req, res, next) => {
  // check if user dont upload next the middleware
  if (!req.file) {
    return next();
  }
  // set to req.file.filename because file in buffer is not have property filename
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.updateData = catchAsync(async (req, res, next) => {
  // 1 ) check if POSTed have password and passwordConfirm
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new errrorApp(
        'If you change the password please change the router /updatePassword',
      ),
    );
  }
  // 2 ) filter fileld for user update
  const filterBody = filterObject(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  // 3 ) update data for user
  const user = await User.findByIdAndUpdate(req.user.id, filterBody, {
    runValidators: true,
    new: true,
  });
  return res.status(200).json({
    status: 'success',
    data: { user },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });
  res.status(200).json({ status: 'success', data: null });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  // console.log('checkkkk', req.params.id);
  next();
};
exports.createUser = factory.createOne(User);
exports.getAllUser = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
