const express = require('express');
const router = express.Router();

const auth = require('../controller/authController');
const controller = require('../controller/bookingController.js');

router.get(
  '/checkout-session/:tourId',
  auth.protect,
  controller.checkoutSession,
);

module.exports = router;
