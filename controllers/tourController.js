const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const AppError = require('../utils/appError');

// a middleware:
exports.aliasTopTours = async (req, res, next) =>{
    req.query.limit = '5';
    req.sort = '-ratingAverage,price';
    req.query.fields='name,price,ratingAverage,summuary,difficulty';
    next();
}

//not a middleware
exports.getAllTours = catchAsyncErrors(async (req,res,next)=>{
     // excuting the query:
     const features = new APIFeatures(Tour.find(), req.query)
     .filter()
     .sort()
     .limitFields()
     .paginate();
 
    const tours = await features.query;

    res.status(200).json({
        status:'success',
        result: tours.length,
        data : {
            tours
        }
    });
    // try{
    //     // excuting the query:
    //     const features = new APIFeatures(Tour.find(), req.query)
    //         .filter()
    //         .sort()
    //         .limitFields()
    //         .paginate();
        
    //     const tours = await features.query;

    //     res.status(200).json({
    //         status:'success',
    //         result: tours.length,
    //         data : {
    //             tours
    //         }
    //     });
    // }catch(err){
    //     res.status(404).json({
    //         status : 'fail',
    //         message : err
    //     });
    // }
})

exports.getTour = catchAsyncErrors( async (req,res,next)=>{
    const tour = await Tour.findById(req.params.id);
    
    if(!tour){
        return next(new AppError('No tour found with that id',404))
    }

    res.status(200).json({
        status:'success',
        data : {
            tour 
        }
    }); 
});


 
exports.createTour = catchAsyncErrors( async (req,res,next)=>{
    const newTour = await Tour.create(req.body);
        res.status(201).json({
            status : 'success',
            data:{
                tour : newTour
            }
         });
});

exports.updateTour = catchAsyncErrors(async (req,res,next)=>{
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status:'success',
        data : {
            tour 
        }
    });
})

exports.deleteTour = catchAsyncErrors(async (req,res,next)=>{
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status:'success',
        data : null
    });  
})

exports.getTourStats = catchAsyncErrors(async (req, res,next) =>{
    const stats = await Tour.aggregate([
        {
            $match:{
                ratingAverage: { $gte: 4.5}
            }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingAverage'},
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'}
                
            }
        },
        {
            $sort: {
                avgPrice: 1 // 1 for asc
            }
        }
        // {
        //     $match: {
        //         _id: {$ne: 'EASY'}
        //     }
        // }
    ]);

    res.status(200).json({
        status:'success',
        data : {
            stats 
        }
    });
})

exports.getMonthlyPlan = catchAsyncErrors(async (req, res,next) =>{
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates' //make many instances of a tour each one with a diffrent startdate
        },
        {
            $match:{
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {$month: '$startDates'},
                numTourStarts: {$sum : 1},
                tours: {$push : '$name'}
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        }
    ]);

    res.status(200).json({ 
        status:'success',
        data : {
            plan 
        }
    });
})