const User = require('../models/userModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
//const APIFeatures = require('../utils/apiFeatures');
//const AppError = require('../utils/appError');


exports.getAllUsers =catchAsyncErrors(async (req,res,next)=>{

    const users = await User.find();
    
    res.status(200).json({
        status:'success',
        result: users.length,
        data:{
            users
        }
    })
});

exports.createUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message : 'route not yet defined' 
    })
}

exports.getUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message : 'route not yet defined' 
    })
}

exports.updateUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message : 'route not yet defined' 
    })
}

exports.deleteUser = (req,res)=>{
    res.status(500).json({
        status:'error',
        message : 'route not yet defined' 
    })
}
