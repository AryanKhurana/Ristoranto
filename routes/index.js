const express = require('express')
// const { validationResult } = require('express-validator')
const router = express.Router()
const csrf = require('csurf')
const Product = require('../models/Product')
const Table = require('../models/Table')
const User = require('../models/User')
const moment = require('moment')
const {check, validationResult} = require('express-validator')
const tables = 20
const csrfProtection = csrf()
router.use(csrfProtection)

router.get('/', (req, res) => {
    res.render('home', {
        'layout': 'basic'
    });
})

router.get('/confirm', (req,res) => {
    res.send("Arigato!")
})

router.get('/menu', async (req, res) => {
    try{
        products = await Product.find().lean()
        res.render('orderlist',{
            'layout': 'basic',
            'products': products
        })
    } catch(err){
        console.error(err)
    }
})

router.get('/table', (req, res, next) => {
    // console.log(req.session.errors)
    res.render('table', {
        csrfToken: req.csrfToken(),
        'layout': 'basic',
        errors: req.session.errors
    })
    req.session.errors = null
})

router.post('/table', [

    check('firstName').notEmpty().withMessage('First Name is required'),
    check('lastName').notEmpty().withMessage('Last Name is required'),
    check('email').isEmail().withMessage('Email is required'),
    check('date').notEmpty().withMessage('Date And time is required'),
    check('time').notEmpty().withMessage('Time is required')

], async (req,res) => {
    
    const errors = validationResult(req).array()

    console.log(errors)
    if(req.body.date){
        if( (new Date() > new Date(req.body.date)) && (new Date().getHours() - req.body.time < 2 )){
            errors.push({
                value: req.body.date,
                msg: 'Date must be greater than current date',
                param: 'date',
                location: 'body'
            })
        }
    }

    if(errors.length != 0){
        req.session.errors = errors
        return res.redirect('/table')
    }
    else{
        var {firstName, lastName, email, persons, mode, date, time} = req.body
        
        const _tables = Table.find({ "date": date, "time": time }, (err) => {
            if(err){
                console.log(err)
            }
        }).lean()
        if(_tables.length === tables) {
            errors.push({
                value: "",
                msg: 'Sorry we are full!',
                param: 'body',
                location: 'body'
            })
            req.session.errors = errors
            return res.redirect('/table')
        }
        else{
            const table = new Table({"firstName": firstName, "lastName": lastName, "email":email, "persons": persons, "mode": mode, "date": date, "time": time })
            table.save((error, data) => {
                if(error){
                    console.log(error)
                }
                if(data) {
                    console.log(data)
                }
            })
        }
        // const customer = new Table({firstName, lastName, email, persons, mode, dateAndTime })
        
        res.render('table', {
            'layout': 'basic'
        })
    }
    
})





router.get('/cart', (req, res) => {
    res.send("hiii")
})

router.post('/cart', async (req,res) => {
    let recID = req.body.proid
    const product = Product.find({ "_id": recID })
    const cartItem = new CartItem({ "product": product })
    
    cartItem.save((err, data) => {
        if(err){
            console.log(err)
        }
        else{
            console.log(data)
        }
    })
})

module.exports = router