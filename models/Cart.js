const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const { Schema } = mongoose;

const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,//takes the id of user 
        ref: User, //it reference to user collection in same db
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Product,
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            }
        }
    ],
    subTotal: {
        type: Number,
        required: true
    },
    shipping: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    }
},{timestamps: true});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;