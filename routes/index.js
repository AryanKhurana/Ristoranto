const express = require('express')
const router = express.Router()
const csrf = require('csurf')
const Product = require('../models/Product')
const Table = require('../models/Table')
const User = require('../models/User')
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const CartItem = require('../models/CartItem')
const tables = 20
const csrfProtection = csrf()
const { ensureAuth, ensureGuest } = require('../middleware/auth');

router.use(csrfProtection)

router.get('/', (req, res) => {
    res.render('home', {
        'layout': 'basic'
    });
})

router.get('/login', ensureGuest, (req, res) => {
    res.render('login', {
        'layout': 'basic'
    })
})

router.get('/cart', async(req, res) => {
    try {
        carts = await CartItem.find({ user: req.user }).lean()
        var products = []
        for (var i = 0; i < carts.length; i++) {
            _product = await Product.find({ _id: carts[i].product }).lean()
            products.push(_product[0]);
        }
        res.render('cart', {
            'layout': 'basic',
            'products': products,
            csrfToken: req.csrfToken(),
        })
    } catch (err) {
        console.error(err + '***')
    }
})

router.get('/about', function(req, res) {
    res.render('ristoranto', {
        'layout': 'basic'
    });
})
router.get('/confirm', (req, res) => {
    res.send("Arigato!")
})

// Menu Page
router.get('/menu', async(req, res) => {
    try {
        products = await Product.find().lean()
        products = await Product.find().lean()
        if (req.query.sortby && !req.query.search) {
            if (req.query.sortby == 1)
                products = await Product.find().sort({ price: 1 }).lean()
            else if (req.query.sortby == 2)
                products = await Product.find().sort({ price: -1 }).lean()
            else if (req.query.sortby == 3)
                products = await Product.find().sort({ name: 1 }).lean()
            else if (req.query.sortby == 4)
                products = await Product.find().sort({ name: -1 }).lean()
        } else if (req.query.search && !req.query.sortby) {
            var regex = new RegExp(req.query.search, 'i')
            products = await Product.find({ name: regex }).lean()
        }

        res.render('menu', {
            'layout': 'basic',
            'products': products,
            'sortby': req.query.sortby,
        })
    } catch (err) {
        console.error(err)
    }
})

//Add To cart
router.get('/addToCart/:id', ensureAuth, async(req, res) => {
    product = await Product.find({ _id: req.params.id }).lean()
    cartItem = await CartItem.find({ user: req.user, product: product[0] }).lean()
    if (!cartItem.length) {
        _cartItem = new CartItem({ user: req.user, product: product[0] })
        _cartItem.save((error, data) => {
            if (error) {
                console.log(error)
            }
            if (data) {

                res.redirect('/menu')
            }
        })
    } else {
        return res.redirect('/')
    }

})

//Add To cart
router.get('/removeFromCart/:id', ensureAuth, async(req, res) => {
    product = await Product.find({ _id: req.params.id }).lean()
    cartItem = await CartItem.find({ user: req.user, product: product[0] }).lean()
    if (cartItem.length) {
        CartItem.deleteOne({ product: product[0], user: req.user }, function(err) {
            if (err) console.log(err);
            res.redirect('/')
        });

    } else {
        return res.redirect('/')
    }

})


// BOok table
router.get('/table', (req, res, next) => {
    res.render('table', {
        csrfToken: req.csrfToken(),
        'layout': 'basic',
        errors: req.session.errors
    })
    req.session.errors = null
})

// Book table
router.post('/table', [

    check('firstName').notEmpty().withMessage('First Name is required'),
    check('lastName').notEmpty().withMessage('Last Name is required'),
    check('email').isEmail().withMessage('Email is required'),
    check('date').notEmpty().withMessage('Date And time is required'),
    check('time').notEmpty().withMessage('Time is required')

], async(req, res) => {

    const errors = validationResult(req).array()

    console.log(errors)
    if (req.body.date) {
        if ((new Date() > new Date(req.body.date)) && (new Date().getHours() - req.body.time < 2)) {
            errors.push({
                value: req.body.date,
                msg: 'Date must be greater than current date',
                param: 'date',
                location: 'body'
            })
        }
    }

    if (errors.length != 0) {
        req.session.errors = errors
        return res.redirect('/table')
    } else {
        var { firstName, lastName, email, persons, mode, date, time } = req.body

        const _tables = Table.find({ "date": date, "time": time }, (err) => {
            if (err) {
                console.log(err)
            }
        }).lean()
        if (_tables.length === tables) {
            errors.push({
                value: "",
                msg: 'Sorry we are full!',
                param: 'body',
                location: 'body'
            })
            req.session.errors = errors
            return res.redirect('/table')
        } else {
            const table = new Table({ "firstName": firstName, "lastName": lastName, "email": email, "persons": persons, "mode": mode, "date": date, "time": time })
            res.redirect('/checkout/' + table)
        }


        res.render('table', {
            'layout': 'basic'
        })
    }

})

router.get('/checkout/:table', (req, res, next) => {
    var amount = 100;
    var errMsg = req.flash('error')[0];
    res.render('checkout', { total: amount, errMsg: errMsg, noError: !errMsg, csrfToken: req.csrfToken() });
});

module.exports = router