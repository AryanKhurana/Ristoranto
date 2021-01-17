const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema({
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
        default: "indian",
        enum: ["indian", "chinese", "french", "italian", "american"]
    },
    productType: {
        default: "veg",
        enum: ["veg", "non-veg"]
    },
    image: {
        type: String,
    },
})

module.exports = mongoose.model('Product', ProductSchema)