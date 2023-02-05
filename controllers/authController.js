const {promisify} = require('util');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');

//const APIFeatures = require('../utils/apiFeatures');

const signToken = id => jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    });

exports.signup = catchAsyncErrors(async(req, res, next) =>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });

    const token = signToken(newUser._id)
    
    res.status(201).json({
        status : 'success',
        token,
        data:{
            user: newUser
        }
    });
});

exports.login = catchAsyncErrors(async (req, res, next) =>{
    const {email, password} = req.body;

    //if email & pass exist
    if(!email || !password){
        return next(new AppError('Provide an email and a password!',400));
    }
    //if user exists & pass is correct
    const user = await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))){        
        return next(new AppError('Incorrect email or password!',401));
    }
    //send token
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});


exports.protect = catchAsyncErrors(async (req, res, next) =>{
    
    //get the jwt
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new AppError('You are not logged in!',401));
    }
    //validate the jwt
    // decode contains the payload info : 
    // decode = {id: 'user id', ..some additional info}
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exists',401));
    }

    //if user changed password after the jwt was issued

    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password! Please login again',401));
    }

    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
        // roles is an array
        if(! roles.includes(req.user.role)){
            return next(new AppError('You do not have permissions! ', 403));
        }

        next();
    }