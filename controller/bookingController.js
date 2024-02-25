const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Tours = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');

exports.checkoutSession = catchAsync(async (req, res) => {
  // get tour from tour id
  const tour = await Tours.findById(req.params.tourId);
  // create checkout session
  console.log(req.user);
  const session = await stripe.checkout.sessions.create({
    // information of session
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}`,
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
