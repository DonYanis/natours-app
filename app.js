const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) middlewares
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));


app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
});

//routes 
app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*', (req,res,next)=>{

    //const err = new AppError(`can't find ${req.originalUrl}`, 404);
    //next(err);
    next(new AppError(`can't find ${req.originalUrl}`, 404));
});

//middle ware for handling errors
app.use(globalErrorHandler);

module.exports = app;
