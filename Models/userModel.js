const mongoose  = require("mongoose");
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
name:{
    type:String,
    required : [true,'Please provide your name'],
    trim:true,
    maxlength: [50, 'Name cannot exceed 50 characters']
},
email:{
    type:String,
    required : [true,'Please provide your email'],
    unique:true,
    lowercase:true,
    trim:true,
    validate:[validator.isEmail,'Please provide a valid email']
},
password:{
    type:String,
    required:[true,'Please provide a password'],
    minlength:[8, 'Password must be at least 8 characters long'],
    select:false
},
passwordConfirm:{
     type:String,
    required:[true,'Please confirm your password'],
    validate:{
        validator:function(value){
            return this.password == value
        },
        message:'Passwords are not the same!'
    }
},
avatar:{
    type:String,
    default:null
},
role:{
    type:String,
    enum:['user','admin'],
    default:'user'
},
isActive: {
      type: Boolean,
      default: true
    },

    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  {
    timestamps: true
  }
)

userSchema.pre('save', async function() {
    if(!this.isModified('password')) return 

    this.password = await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined
})

userSchema.methods.changedPasswordAfter = function(JWTTimetamp){
    if(this.passwordChangedAt){
        // 1. convert time into seconds to compare with JWTTimetamp
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime()/1000,10
        )

        // 2. compare jwtTime and changePasswordTime 
        return JWTTimetamp < changedTimestamp ;
    }

    // if password not changed 
    return false;
}

userSchema.methods.correctPassword = async function (currentPassword ,userPassword) {

    return await bcrypt.compare(currentPassword,userPassword);
    
}


userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


const User = mongoose.model('User',userSchema)
module.exports = User;