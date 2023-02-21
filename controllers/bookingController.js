const stripe = require('stripe')(process.env.STRIPE_SK);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsyncErrors = require('../utils/catchAsyncErrors');
const factory = require('./handlerFactory');
//const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsyncErrors(async (req, res, next) =>{
    //get tour
    const tour = await Tour.findById(req.params.tourId);
    //create the checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });
    //send it
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout =catchAsyncErrors(async (req, res, next) => {
    const {tour, user, price} = req.query;
    if(!tour && !user && !price) return next();

    await Booking.create({tour, user, price});
    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);