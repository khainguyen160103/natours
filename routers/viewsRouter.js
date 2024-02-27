const express = require('express');
const router = express.Router();

const controller = require('../controller/viewsController');
const auth = require('../controller/authController');
const bookingController = require('../controller/bookingController');

router.get('/', bookingController.createBookingTour , auth.loginIn, controller.getOverview);
router.get('/tour/:slug', auth.loginIn, controller.getTour);
// login
router.get('/login', auth.loginIn, controller.login);
router.get('/me', auth.protect, controller.getAccount);
router.get('/get-my-tour', auth.protect, controller.getMyTour);
router.post('/update-user-data', auth.protect, controller.updateAccount);
module.exports = router;
