const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const addressRouter = require('./addressRoutes');
const wishlistRouter = require('./wishlistRoutes');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

// Nested route for addresses
router.use('/:userId/addresses', addressRouter);
router.use('/:userId/wishlist', wishlistRouter);

// router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
