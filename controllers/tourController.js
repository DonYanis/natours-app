const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage()

const multerFilter = (req,file,cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true);
    }else{
        cb(new AppError('Not an image', 400));
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]);

exports.resizeTourImages =catchAsyncErrors(async (req,res,next)=>{
    if(!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover =  `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.file.imageCover[0].buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`);
    
        
    await Promise.all( 
        req.files.images.map(async (file, i)=>{
            const filename =  `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000,1333)
                .toFormat('jpeg')
                .jpeg({quality: 90})
                .toFile(`public/img/tours/${filename}`);
            req.body.images.push(filename);
        })
    );

    next();
});

// a middleware:
exports.aliasTopTours = async (req, res, next) =>{
    req.query.limit = '5';
    req.sort = '-ratingAverage,price';
    req.query.fields='name,price,ratingAverage,summuary,difficulty';
    next();
}

//not a middleware
exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, {path: 'reviews'});

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);


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
});


exports.getToursWithin = catchAsyncErrors(async (req, res,next) =>{
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    //unit = 'mi' or 'km'
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat ||!lng){
        return next(new AppError('Incorrect foramt of lat and lng !',400));
    }

    const tours = await Tour.find({
        startLocation: {
            $geoWithin: {
                $centerSphere:[[lng, lat], radius]
            }
        }
    });

    res.status(200).json({ 
        status:'success',
        result: tours.length,
        data : {
            tours 
        }
    });
});

exports.getDistances = catchAsyncErrors(async (req, res,next) =>{
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    //unit = 'mi' or 'km'
    // convert to miles or km
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    if(!lat ||!lng){
        return next(new AppError('Incorrect foramt of lat and lng !',400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        }, 
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({ 
        status:'success',
        result: distances.length,
        data : {
            distances 
        }
    });
});