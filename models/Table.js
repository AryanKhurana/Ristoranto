const mongoose = require('mongoose')

const TableSchema = new mongoose.Schema({
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
        type: Number,
        default: 1,
        enum: [1, 2, 3, 4]
    },
    bookedAt: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true
    },
})
module.exports = mongoose.model('Table', TableSchema)