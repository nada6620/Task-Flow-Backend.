const AppError = require('../utils/appError')

// 1- Handle Invalid MongoDB ObjectId
const handleCastErrorDB = (err)=>{
    const message = `invalid ${err.path}:${err.value}`;
    return new AppError(message,400)
}

// 2- Handle Duplicate Fields
const handleDuplicateFieldsDB =(err)=>{
    const field = Object.keys(err.keyValue||{})[0] // return field name

    let message;
    if(field == 'email'){
        message = 'This email is already registered. Please use another email.'
    }
    else if (field){
        message = `This ${field} is already in use. Please use another value.`;
    }
    else{
        message = 'A record with this value already exists.';
    }

    return new AppError(message,409);
}

// 3-  Handle Mongoose Validation Errors (password less than 8)
const handleValidationErrorDB  = (err) =>{
    // collect all errors in one messages array contain details of each field fail in validation
    const errors = Object.values(err.errors).map(
        el=>el.message
    )

    const message = errors.join('.');
    return new AppError(message,400);
}

// 4- invalid jwt
const handelJWTError = () =>{
    return new AppError(
        'Invalid token. Please log in again!',401
    )
}

//5- Expired JWT
const handleJWTExpiredError = () => {
  return new AppError(
    'Your token has expired! Please log in again.',
    401
  );
};

const sendErrorDev = (err,res)=>{
    res.status(err.statusCode).json({
        status:err.status,
        message:err.message,
        error:err,
        stack:err.stack
    })
}

const sendErrorProd = (err,res)=>{
    if(err.isOperational){
        return res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        })
    }

    // Programming or Unknown Errors
  console.error('ERROR', err);

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });

}

//  Global Error Handling Middleware

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode||500;
    err.status = err.status || 'error'
    let error = err;

   if(error.name === 'CastError' ){
         error = handleCastErrorDB(error);
  } 
  if (error.code === 11000) {
    error = handleDuplicateFieldsDB(error);
  }

  if (error.name === 'ValidationError') {
    error = handleValidationErrorDB(error);
  }

  if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
// Development Environment
  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(error, res);
  }

  // Production Environment
  return sendErrorProd(error, res);

}
