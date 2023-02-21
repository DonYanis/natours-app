const mongoose = require('mongoose');
const slugify = require('slugify');
//const User = require('./userModel');
//const validator = require('validator');


const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'a tour must have a name !'],
        unique: true,
        trim: true,
        maxlength: [40, 'a tour name must have lte 40 chars'],
        minlength: [8, 'a tour name must have gte 10 chars']
       // validate: [validator.isAlpha, 'name must be aplha']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true,'a tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true,'a tour must have a groupe size']
    },
    difficulty: {
        type: String,
        required: [true,'a tour must have a difficulty'],
        enum: {
            values: ['easy','medium','difficult'],
            message: 'Difficulty must be in : easy, medium, difficult '
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1.0'],
        max: [5, 'rating must be under 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val){ //val is the priceDiscount
                return val< this.price;
            },
            message: 'priceDiscount ({VALUE}) must be less than the price !'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: { //nested Object
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number], //array of numbers
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true}
});

//indexes
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});
//tourSchema.index({price:1});
//compound index : 1 :ASC, -1DESC
tourSchema.index({price:1, ratingsAverage: -1});

// virtual ppt:
//we cant use them in queries because virt ppt are not in database !!!!!
tourSchema.virtual('durationWeeks').get( function(){
    return this.duration / 7;
});
//virtual populate
tourSchema.virtual('reviews',{
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});


// doc middleware: runs before doc.save() or .create() 
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});
//the tour guides
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// });

//query middleware
// regex /^find/ all words starting with find
tourSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}});
    this.start = Date.now();
    next();
});

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});


tourSchema.post(/^find/, function(docs, next){
    console.log(`query took ${Date.now()-this.start}`);
    next();
});

//aggregation middleware:
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({
//         $match: {secretTour: {$ne: true}}
//     });
//     next();
// });

const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;
