const express = require('express');
const controller = require('./../controller/reviewController');
const auth = require('./../controller/authController');
const router = express.Router({ mergeParams: true });

router.use(auth.protect);
router.post(
  '/',
  auth.reStrictTo('user'),
  controller.setTourUserId,
  controller.createReview,
);
router.get('/', controller.getAllReviews);
router.get('/:id', controller.getReview);
router.delete('/:id', controller.deleteReview);
router.patch('/:id', controller.updateReview);
module.exports = router;
