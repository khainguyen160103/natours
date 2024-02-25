const express = require('express');

const router = express.Router();
const controller = require('../controller/userController');
const auth = require('../controller/authController');

router.post('/signup', auth.signup);

router.get('/logout', auth.logout);
router.post('/login', auth.login);
router.post('/forgotPassword', auth.forgotPassword);
router.patch('/resetPassword/:token', auth.resetPassword);

//use protect for all router below
router.use(auth.protect);

router.patch('/updatePassword', auth.updatePassword);
router.patch(
  '/updateData',
  controller.uploadSingleImage,
  controller.resizeImage,
  controller.updateData,
);
router.delete('/deleteMe', controller.deleteMe);
router.get('/getMe', controller.getMe, controller.getUser);

router.route('/').get(controller.getAllUser).post(controller.createUser);

router
  .route('/:id')
  .get(controller.getUser)
  .patch(controller.updateUser)
  .delete(auth.reStrictTo('admin'), controller.deleteUser);

module.exports = router;
