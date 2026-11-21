const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const morgen =require('morgan')
const cookieParser = require('cookie-parser');
const app = express()

const AppError = require('./utils/appError')
const globalErrorHandler = require('./Controllers/errorController')

app.use(cors())
// add Security Headers HTTPS
app.use(helmet())

if(process.env.NODE_ENV=="development"){
    app.use(morgen('dev'))
}

app.use(express.json({limit: '10kb'}))
app.use(cookieParser)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: 'Too many requests, please try again later.'
});

app.use('/api',limiter)

const authRoutes = require('./Routes/authRoutes');

app.use('/api/v1/auth',authRoutes);

// 3) HANDLE UNDEFINED ROUTES
app.all('/{*splat}', (req, res,next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`,404))
});

app.use(globalErrorHandler)

module.exports= app;

