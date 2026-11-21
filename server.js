const dotenv = require('dotenv')
dotenv.config({path:'./config.env'});

const mongoose = require('mongoose');
const app =require('./app')

// 1) Handle uncaught errors , try/catch and error handler can't catch error 
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);


const DB = process.env.DATABASE.replace('<db_password>',encodeURIComponent(process.env.DATABASE_PASSWORD))
mongoose.connect(DB)
.then(()=>{
    console.log('DB connection successful !');
})
.catch(err=>{
    console.error('Database connection failed:', err.message);
    process.exit(1);
})

const port = process.env.PORT
app.listen(port,()=>{
    console.log(`App running on port ${port}...`)
})

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});