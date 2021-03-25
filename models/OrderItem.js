const mongoose = require('mongoose')

const OrderItemSchema = new mongoose.Schema({
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        required: true,
    },
    deliveryCharges: {
        type: Number,
        default: 40
    },
    quantity: [{
        type: String,
        required: true
    }],
    bookedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('OrderItem', OrderItemSchema)