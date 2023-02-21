const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');


const router = express.Router();


router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/login', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//protect all routes after this: 
router.use(authController.protect);

router.patch('/updateMyPassword',authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/updateMe',userController.uploadUserPhotos,userController.resizeUserPhoto, userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);



//restrict to admin all routes after this: 
router.use(authController.restrictTo('admin'));

router.route('/')
        .get(userController.getAllUsers)
        .post(userController.createUser);

router.route('/:id')
        .get(userController.getUser)
        .patch(userController.updateUser)
        .delete(userController.deleteUser);

module.exports = router;