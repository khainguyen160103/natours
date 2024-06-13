const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const errorApp = require('../utils/errApp');
const User = require('../models/userModel');
const Email = require('../utils/email');
const crypto = require('crypto');

const sigToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.EXPIRES,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = sigToken(user._id);
  const cookieOpt = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    ),
  };
  if (process.env.NODE_ENV === 'production') cookieOpt.secure = true;
  res.cookie('jwt', token, cookieOpt);
  user.password = undefined;
  return res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  //  'http://127.0.0.1:3000/api/v1/users/updatePassword'
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(newUser, 201, res);
});

exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'logouted', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  return res.status(200).json({
    status: 'success',
  });
});

exports.login = async (req, res, next) => {
  const { password, email } = req.body;
  // check if email and password privide
  if (!password || !email) {
    return next(new errorApp('please provide password or email', 401));
  }
  // check if user
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new errorApp('incorrect email or password', 401));
  }
  // if everything ok send token
  createSendToken(user, 200, res);
};
exports.protect = catchAsync(async (req, res, next) => {
  // 1) check if have token and
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new errorApp('You are not logged in , please loggin to access', 401),
    );
  }
  // 2) verify token
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);

  // 3) check if user still exists
  // user is logged in after data of user is deleted from database => not exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new errorApp('user not belong with token', 401));
  }
  // 4) check if user change password after token was issued
  if (currentUser.passswordAterChange(decoded.iat)) {
    return next(
      new errorApp('user changed password , please login again', 401),
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  // return false if user not changed password
  next();
});

exports.loginIn = catchAsync(async (req, res, next) => {
  // 1) check if have token and
  if (req.cookies.jwt) {
    // 2) verify token
    if (req.cookies.jwt === 'logouted') {
      return next();
    }
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.SECRET_KEY,
    );
    // 3) check if user still exists
    // user is logged in after data of user is deleted from database => not exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    // 4) check if user change password after token was issued
    if (currentUser.passswordAterChange(decoded.iat)) {
      return next();
    }

    res.locals.user = currentUser;
    return next();
    // return false if user not changed password
  }
  next();
});

exports.reStrictTo = (...roles) => {
  return (req, res, next) => {
    // role = [admin , lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(
        new errorApp('You have not permissions to do something', 403),
      );
    }
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1 get user email base on POSTed request
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new errorApp('there is no user with email ', 404));
  }
  //2 generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3 send it to user's email
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host',
    )}/api/users/resetPassword/ ${resetToken}`;
    // console.log('check');
    await new Email(user, resetUrl).sendResetPassword();
    res.status(200).json({
      status: 'success',
      message: 'sent token successfully to email address',
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    return next(new errorApp('there was an error send email ', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user base on token
  const resetToken = req.params.token;
  if (!resetToken) {
    return next(new errorApp('please provide a token reset password ', 404));
  }
  const tokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpiresAt: { $gt: Date.now() },
  });
  // 2) If token not expired and there is user , set new password
  if (!user) {
    // console.log(user);
    return next(new errorApp('Your token has expired !!', 404));
  }
  // 3) update passwordChangeAt for user
  user.passwordResetExpiresAt = undefined;
  user.passwordResetToken = undefined;
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) login for user via JWT token
  const token = sigToken(user._id);
  return res.status(200).json({
    status: 'success',
    token,
  });
});
exports.updatePassword = async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new errorApp('the user does not exist', 404));
  }
  // 2) check if POSTed password is correct password
  const passwordCheck = await user.correctPassword(
    req.body.passwordCurrent,
    user.password,
  );
  if (!passwordCheck) {
    return next(new errorApp('please enter exactly your old password', 404));
  }
  // 3) update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) login user
  const token = sigToken(user._id);
  createSendToken(user, 200, res);
};
