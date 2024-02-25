class errorApp extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOpenrational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = errorApp;
