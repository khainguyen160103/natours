const ErrorApp = require('../utils/errApp');

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOpenrational === true) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
  } else {
    if (req.originalUrl.startsWith('/api')) {
      res.status(err.statusCode).json({
        status: err.status,
        err: err,
        message: err.message,
        stack: err.stack,
      });
    } else {
      console.log(err);
      res.status(err.statusCode).render('error', {
        title: 'Error',
        message: 'Please try again later!',
      });
    }
  }
};
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      err: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.log(err);
    res.status(err.statusCode).render('error', {
      title: 'Error',
      message: err.message,
    });
  }
};
const handleCastErrorDB = (error) => {
  const message = `invalid ${error.path} with ${error.value}`;
  return new ErrorApp(message, 400);
};
const handleDuplicateErrorDB = (error) => {
  const value = error.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const msg = `value ${value} is duplicate , please use another value`;
  return new ErrorApp(msg, 404);
};
const handleValidationErrorDB = (error) => {
  const value = Object.values(error.errors).map((msg) => msg.message);
  console.log(value);
  const message = `invalid input data ${value.join(' ')} `;
  return new ErrorApp(message, 404);
};
const handleJWTError = () => {
  return new ErrorApp('Invalid token , please login again', 401);
};
const handleTokenExpiredError = () => {
  return new ErrorApp('your token expired , please login again', 401);
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  let error = { ...err, name: err.name, message: err.message };
  if (process.env.NODE_ENV === 'production') {
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      error = handleDuplicateErrorDB(error);
    }
    if (error.name === 'ValidationError') {
      console.log(error.name);
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if ((error.name = 'TokenExpiredError'));
    {
      error = handleTokenExpiredError();
    }
    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  }
  next();
};
