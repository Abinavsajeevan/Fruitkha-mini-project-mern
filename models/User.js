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
        type: Number,
        required: true,
        unique: true,
        min: 10,
        max: 13
    },
    password: {
        type: String,
        required: true,
        minlength:  6,
        maxlength: 15
    },
    isBlocked: {
        type: Boolean,
        default: null
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
