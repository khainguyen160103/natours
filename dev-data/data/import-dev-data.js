const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
require('dotenv').config({
  path: './config.env',
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

const Db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATEBASE_PASSWORD,
);
mongoose
  .connect(Db, {
    useNewUrlParser: true,
  })
  .then(() => console.log('connected'));
// create tour data from file system
const createTour = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, {
      validateBeforeSave: false,
    });
    await Review.create(reviews);
    console.log('created successfull');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
const deleteTour = async () => {
  try {
    await Tour.deleteMany();
    await Review.deleteMany();
    await User.deleteMany();
    console.log('deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};
console.log(process.argv);
if (process.argv[2] === '--import') {
  createTour();
} else {
  deleteTour();
}
