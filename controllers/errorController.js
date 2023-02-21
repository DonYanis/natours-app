const AppError = require('../utils/appError');

const handleCastErrorDB = err =>{
    const message = `Invalide ${err.path}: ${err.value}.`
    return new AppError(message,400);
}

const handleDuplicateFieldsDB = err =>{
    const value = JSON.stringify(err.keyValue).match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value : ${value}.`
    return new AppError(message,400);
}

const handleValidationErrorDB = err =>{
    const errors = Object.values(err.errors).map(e=> e.message);
    const message = `Invalide input data : ${errors.join('. ')}.`
    return new AppError(message,400);
}

const handleJWTError = () => new AppError('Invalid token. Please Login again',401);

const handleJWTExpiredError = () => new AppError('Your token has expired. Please Login again',401);

const sendErrorDev = (err,req, res)=>{
    
    if(req.req.originalUrl.startsWith('/api')) {
        req.status(err.statusCode).json({
            status: err.status,
            error : err,
            message: err.message,
            stack : err.stack
        });
    }else{
        req.status(err.statusCode).render('error',{
            title: 'Something went wrong',
            msg: err.message
        })
    }
}

const sendErrorProd = (err,req, res)=>{
    if(req.req.originalUrl.startsWith('/api')) {
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        }
        console.error('ERROR ! ',err);
        return res.status(500).json({
            status: 'error',
            message: 'Something went wrong'
        });
        
    }
    if(err.isOperational){
        return req.status(err.statusCode).render('error',{
            title: 'Something went wrong',
            msg: err.message
        });
    }
}

module.exports = (err, req ,res, next)=>{

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    const errorType = err.name;
    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,res);
    }else if(process.env.NODE_ENV === 'production '){
        
        let error = {...err};
        if(errorType === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(errorType === 'ValidationError') error = handleValidationErrorDB(error);
        if(errorType === 'JsonWebTokenError') error = handleJWTError();
        if(errorType === 'TokenExpiredError') error = handleJWTExpiredError();
        sendErrorProd(error,res);

    }
};