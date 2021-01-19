const express = require('express');
const { check, validationResult } = require('express-validator');
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const Product = require('../models/Product');
const router = express.Router()
const { isProductRequestValidted, validateProductRequest } = require('../validators/admin');

router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        'layout': 'basic'
    })
})

router.post("/addProduct",ensureAuth, validateProductRequest, isProductRequestValidted,async (req, res) => {
    product = Product.findOne({ name: req.body.name }).exec((error, product) => {
        if(product){
            return res.status(400).json({
                message: 'Product already exists'
            });
        } 

        const {
            name,
            price,
            description,
            cuisine,
            productType,
            image = ""
        } = req.body
        const _product = new Product({name, price, description, cuisine, productType, image})

        _product.save((error, data) => {
            if(error){
                return res.status(400).json({
                    message: "Something went wrong"
                });
            }
            if(data){
                return res.status(200).json({
                    product: data
                })
            }
        })
    })
})

router.get('/dashboard', ensureAuth, (req, res) => {
    res.send(req.user.displayName)
})

module.exports = router