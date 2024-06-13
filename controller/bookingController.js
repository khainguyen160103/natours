const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Bookings = require('../models/bookingModel');
const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.checkoutSession = catchAsync(async (req, res) => {
  // get tour from tour id
  const tour = await Tours.findById(req.params.tourId);
  // create checkout session
  // console.log(req.user);
  const session = await stripe.checkout.sessions.create({
    // information of session
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    // information of product
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
          unit_amount: tour.price * 100,
        },
      },
    ],
    mode: 'payment',
  });
  // response checkout session
  return res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingTour = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Bookings.create({ tour, user, price });

  return res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = catchAsync(async (req, res, next) => {
  const tours = await Bookings.find({});
  return res.status(200).json({ status: 'sucsess', data: tours });
});

exports.createBooking = catchAsync(async (req, res, next) => { });

exports.updateBooking = catchAsync(async (req, res, next) => { });

exports.deleteBooking = catchAsync(async (req, res, next) => { });
