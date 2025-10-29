const mongoose = require('mongoose');
const User = require('./User');
const Product = require('./Product');
const { Schema } = mongoose;

const wishlistSchema = new Schema( {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Product
        },
    ],
}, { timestamps: true } );

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;