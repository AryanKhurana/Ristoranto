const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        default: "Indian",
        enum: ["Chinese","Indian","Mexican","Italian","Bhutanese","Nepalese","American"],
    },
    productType: {
        type: String,
        default: "veg",
        enum: ["veg", "non-veg"]
    },
    image: {
        type: String,
        default: ""
    },
})

module.exports = mongoose.model('Product', ProductSchema)