const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    mobile: {
         type: String, // use string instead of number
      
      unique: true,
      match: [/^\d{10,13}$/, 'Mobile number must be 10-13 digits'] 
    },
    password: {
        type: String,
       
        minlength:  6
    },
     googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
    isBlocked: {
        type: Boolean,
        default: false
    },
    otp: 
    {
        type: String, 
        default: null 
    }  },
{ timestamps: true }
)
// connect mongodb to users
const User = mongoose.model('User', userSchema);
module.exports = User;
