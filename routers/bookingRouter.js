const express = require('express');
const router = express.Router();

const auth = require('../controller/authController');
const controller = require('../controller/bookingController.js');

router.use(auth.protect);

router.get('/checkout-session/:tourId', controller.checkoutSession);

router.use(auth.reStrictTo('admin', 'lead-guide'));

router.get('/', controller.getAllBookings);
router.post('/', controller.createBooking);

router.patch('/:tourId', controller.updateBooking);

router.delete('/:tourId', controller.deleteBooking);

module.exports = router;
