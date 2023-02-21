const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

//const APIFeatures = require('../utils/apiFeatures');

const signToken = id => jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
});

const createSendToken = (user, statusCode, res) =>{
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt',token, cookieOptions);
//remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data:{
            user
        }
    });
}

exports.signup = catchAsyncErrors(async(req, res, next) =>{
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser,201,res);
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
    createSendToken(user,200,res);

});

exports.logout = (req, res, next) =>{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now()+ 10 *1000),
        httpOnly: true
    });
}


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

exports.isLoggedIn = catchAsyncErrors(async (req, res, next) =>{
    
    if (req.cookies.jwt){
        try{

            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
    
            const currentUser = await User.findById(decoded.id);
            if(!currentUser){
                return next();
            }
    
            if(currentUser.changedPasswordAfter(decoded.iat)){
                return next();
            }
    
            res.user = currentUser;
            res.locals.user = currentUser;
            return next();
        }catch(err){
            return next();
        }
    }
    next();
});


exports.restrictTo = (...roles) => (req, res, next) => {
        // roles is an array
        if(! roles.includes(req.user.role)){
            return next(new AppError('You do not have permissions! ', 403));
        }

        next();
    }

exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {
    // get user based on email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('Email not found',404));
    }
    //generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    //send it to user email
    
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
        await new Email(user, resetURL).sendPasswordReset();
        
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch(err){
        user.PasswordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error in sending the mail',500));
    }
    
});

exports.resetPassword = catchAsyncErrors( async (req, res, next) => {
    //get user
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gte: Date.now()}
    });
    //if token not expired + user exists : update pass
    if(!user){
        return next(new AppError('Token is invalid or has expired',400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.PasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //update changedpasswordAt (in the middleware)
    //login (send jwt)
    createSendToken(user,201,res);

});

exports.updatePassword =catchAsyncErrors(async (req,res,next) =>{
    //get the user
    const user = await User.findById(req.user.id).select('+password')
    //check if pass correct
    if(! await user.correctPassword(req.body.passwordCurrent, user.password)){
        return next(new AppError('Password is not correct',401));
    }
    //update the pass, send JWT
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createSendToken(user,201,res);
});