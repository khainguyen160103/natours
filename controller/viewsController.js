const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  return res.status(200).render('overview', {
    title: 'All Tour',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res) => {
  // get data from tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'review',
    populate: {
      path: 'user',
    },
  });
  // build the template
  // render template
  return res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;",
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});

exports.login = catchAsync(async (req, res) => {
  return res
    .set(
      'Content-Security-Policy',
      "connect-src 'self' https://cdnjs.cloudflare.com",
    )
    .render('login', {
      title: 'Login',
    });
});

exports.getAccount = (req, res) => {
  return res.render('account', {
    title: 'Your account',
  });
};

exports.updateAccount = async (req, res, next) => {
  console.log(req.user);
  const userUpdate = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );
  return res.status(200).render('account', {
    title: 'Your Account',
    user: userUpdate,
  });
};
