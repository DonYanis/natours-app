const path = require('path');

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const routesRouter = require('./routes/routeRoutes');

const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

//serving static files
app.use(express.static(path.join(__dirname,'public')));

// 1) global middlewares
//set security HTTP headers
app.use(helmet());

//dev logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//${max} reqs in ${windowMs} ms from the same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({
    extended: true,
    limit: '10kb'
}))
app.use(cookieParser());
//data sanitization against nosql query injection
app.use(mongoSanitize());
//data sanitization against XSS
app.use(xss());
//prevent prarams pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'price',
            'difficulty',
            'maxGroupeSize'
        ]
    })
);

app.use(compression());

//test midddlewares
app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
});

//routes 
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);
app.use('/api/v1/routes',routesRouter);
app.use('/',viewRouter);

app.all('*', (req,res,next)=>{

    //const err = new AppError(`can't find ${req.originalUrl}`, 404);
    //next(err);
    next(new AppError(`can't find ${req.originalUrl}`, 404));
});

//middle ware for handling errors
app.use(globalErrorHandler);

module.exports = app;
