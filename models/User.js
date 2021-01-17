const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    googleId: {
        type:String,
        required:true,
    },
    defaultName: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const ProductSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    cuisine:{
        type: String,
        required: true,
    },
    vegetarian:{
        type: Boolean,
        default:false,
    },
    price:{
        type: Number,
        required: true,
    },
    })

module.exports.User = mongoose.model('User', UserSchema)
module.exports.Product=mongoose.model('Product',ProductSchema)
