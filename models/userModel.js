const mongoose = require('mongoose');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    required: [true, 'please enter your name'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please enter your email'],
  },
  password: {
    type: String,
    required: [true, 'please enter your password'],
    minLength: 8,
    select: false,
  },
  role: {
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
    type: String,
  },
  passwordConfirm: {
    type: String,
    minLength: 8,
    // this only work on create and save
    validate: {
      validator: function (value) {
        return value === this.password;
      },
    },
  },
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  // candidate password is password from the body req and user password from db
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.passswordAterChange = function (JWTtimestamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10,
    );
    return changeTimeStamp > JWTtimestamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  // create token to send for user's email
  const resetToken = crypto.randomBytes(32).toString('hex');

  // encrypt token using bult-in module
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log({ resetToken }, this.passwordResetToken);
  // set time for update password
  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangeAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.pre('save', async function (next) {
  // only work when modify password
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});
const User = mongoose.model('Users', userSchema);
module.exports = User;
