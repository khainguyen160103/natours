const express = require('express');

const auth = require('../controller/authController');
const router = express.Router();
const controller = require('../controller/tourController');
const reviewRouter = require('./reviewRoter');
// POST tours/:tourId/review/
router.use('/:tourId/review', reviewRouter);

router
  .route('/')
  .get(
    auth.protect,
    auth.reStrictTo('admin', 'lead-guide'),
    controller.getAllTours,
  )
  .post(controller.createTour);
router
  .route('/:id')
  .get(controller.getTours)
  .patch(
    auth.protect,
    auth.reStrictTo('admin', 'lead-guide'),
    controller.uploadImagesTour,
    controller.resizeImagesTour,
    controller.updateTour,
  )
  .delete(
    auth.protect,
    auth.reStrictTo('lead-guide', 'admin'),
    controller.deleteTours,
  );

// /tours-within/:distance/center/:latlng/unit/:unit
router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  controller.getTourWithin,
);

// /tours-within/distance/:latlng/unit/:unit
router.get(
  '/tours-within/distance/:latlng/unit/:unit',
  controller.getDistances,
);

// router.param('id', controller.checkID);
router.get('/tour-stat', controller.getTourStats);
router.get(
  '/monthly-plan/:year',
  auth.protect,
  auth.reStrictTo('admin', 'lead-guide'),
  controller.getMonthlyPlan,
);
router.route('/top-5-cheap').get(controller.aliasTop, controller.getAllTours);

// POST tours/:tourId/review/
// router.post(
//   '/:tourId/review/',
//   auth.protect,
//   auth.reStrictTo('user'),
//   reviewController.createReview,
// );
// GET tours/:tourId/review/:reviewId
module.exports = router;
