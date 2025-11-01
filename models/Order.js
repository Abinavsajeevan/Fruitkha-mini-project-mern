const mongoose = require('mongoose');
const Product = require('./Product');
const { Schema } = mongoose;

const orderSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        //it store if any changes in future for order or edit not change the original 
        address: {
            fullName: String,
            phone: String,
           alternatePhone: String,
            street: String,
            city: String,
            district: String,
            pincode: String,
            country: String,
            label: String 
        },

        items: [
            {
                ProductId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: String,
                quantity: {
                    type: Number,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
                total: {
                    type: Number,
                    required: true
                }
            }
        ],

        totalAmount: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ['cod', 'card'],
            default: 'cod'
        },

        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },

        orderStatus: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        },
        
        deliveryInstruction: {
            type: String,
            default: ''
        },

        deliveredAt: Date

    }, {timestamps: true}
);

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;