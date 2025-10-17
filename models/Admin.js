const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        minlengt: 6
    } 
},
{timestamps: true})

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;