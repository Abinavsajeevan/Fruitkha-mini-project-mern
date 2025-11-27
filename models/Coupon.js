const mongoose = require('mongoose');
const { Schema } = mongoose;

const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    discount: {
        type: Number,
        required: true,
        min: 0
    },
    expiry: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Blocked'],
        default: 'Active'
    }
}, {timestamps: true});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;