const { truncates } = require('bcryptjs');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const enquirySchema = new Schema({
        name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: truncates
    },
    phone: {
         type: String, 
         trim: true,
        match: [/^\d{10,13}$/, 'Mobile number must be 10-13 digits'] 
    },
    subject: {
        type: String,
        required: true,
        maxlength: 100, 
        trim: true
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000, 
        trim: true 
    },
    status: { 
        type: String, 
        enum: ['Pending','Resolved'], 
        default: 'Pending' 
    },
    reply: {
        type: Boolean,
        default: false
    }

},{timestamps: true});

const Enquiry = mongoose.model('Enquiry', enquirySchema);
module.exports = Enquiry;