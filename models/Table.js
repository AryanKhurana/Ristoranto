const mongoose = require('mongoose')

const TableSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    persons: {
        default: 1,
        enum: [1, 2, 3, 4]
    },
    mode: {
        default: "offline",
        enum: ["offline", "online"]
    },
    bookedAt: {
        type: Date,
        default: Date.now
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    money: {
        type: Number,
        default: 0
    },
})
module.exports = mongoose.model('Table', TableSchema)