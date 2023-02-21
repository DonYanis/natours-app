const Tour = require('../models/tourModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsyncErrors(async (req,res,next)=>{
    //get tour data
    const tours = await Tour.find();
    //build template

    //render template
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsyncErrors(async (req,res,next)=>{
    //get data
    const tour = await Tour.findOne({slug: req.params.slug}).populate({path: 'reviews',fields: 'review rating user'});
    if(!tour){
        return next(new AppError('No tour with that name',404));
    }
    //build template

    //render
    res.status(200).render('tour', {
        title: tour.name,
        tour
    })
});

exports.getLoginForm = (req, res)=>{
    res.status(200).render('login', {
        title: 'Log In'
    });
}


exports.getAccount = (req, res) => {
    res.status(200).render('account', {
      title: 'Your account'
    });
  };

exports.getMyTours = catchAsyncErrors(async (req, res, next) => {
    const bookings = await Booking.find({user: req.user.id});
  
    const tourIDs = bookings.map(el=>el.tour);
    const tours = await Tour.find({ _id:{$in: tourIDs}})

    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });
  
exports.updateUserData = catchAsyncErrors(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
  
    res.status(200).render('account', {
      title: 'Your account',
      user: updatedUser
    });
  });

exports.getRoutes =  (req, res,next) =>{
    
    const routes = {
        tours : {
            main : 'api/v1/tours',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                },
                {
                    route : '/top-5-cheap',
                    methods: ['GET']
                },
                {
                    route : '/tour-stats',
                    methods: ['GET']
                },
                {
                    route : '/monthly-plan/:year',
                    methods: ['GET','POST']
                },
                {
                    route : '/tours-within/:distance/center/:latlng/unit/:unit',
                    methods: ['GET']
                },
                {
                    route : '/distances/:latlng/unit/:unit',
                    methods: ['GET','POST']
                },
                {
                    route : '/:tourId/reviews',
                    methods: ['GET','POST']
                },
                {
                    route : '/:tourId/reviews/:id',
                    methods: ['GET','PATCH','DELETE']
                }
            ]
        },
        users : {
            main : 'api/v1/users',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                },
                {
                    route : '/signup',
                    methods: ['POST']
                },
                {
                    route : '/login',
                    methods: ['GET','POST']
                },
                {
                    route : '/forgotPassword',
                    methods: ['POST']
                },
                {
                    route : '/resetPassword/:token',
                    methods: ['PATCH']
                },
                {
                    route : '/updateMyPassword',
                    methods: ['PATCH']
                },
                {
                    route : '/me',
                    methods: ['GET']
                },
                {
                    route : '/updateMe',
                    methods: ['PATCH']
                },
                {
                    route : '/deleteMe',
                    methods: ['DELETE']
                }
            ]
        },
        reviews : {
            main : 'api/v1/reviews',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                }                
            ]
        },
        bookings : {
            main : 'api/v1/bookings',
            routes : [
                {
                    route : '/',
                    methods: ['GET','POST']
                },
                {
                    route : '/:id',
                    methods: ['GET','PATCH','DELETE']
                }                
            ]
        },
        views : {
            main : '',
            routes : [
                {
                    route : '/',
                    methods: ['GET']
                },
                {
                    route : '/tour/:slug',
                    methods: ['GET']
                },
                {
                    route : '/login',
                    methods: ['GET']
                },
                {
                    route : '/me',
                    methods: ['GET']
                },
                {
                    route : '/my-tours',
                    methods: ['GET']
                },
                {
                    route : '/submit-user-data',
                    methods: ['POST']
                }               
            ]
        }
    } 

    res.status(200).render('routes', {
      title: 'My routes',
      routes
    });
}
