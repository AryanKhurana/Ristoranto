const express = require('express')
const router = express.Router()
const csrf = require('csurf')
const Product = require('../models/Product')
const Table = require('../models/Table')
const User = require('../models/User')
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const tables = 20
const csrfProtection = csrf()
    // Stripe
const PUBLISHABLE_KEY = "pk_test_51ICkQ3Koy0nW0rNuHrLUZfbvh3eFsFrUUTVgGGavttDTvEhYPzEgXmrAyXPKk1F3lkcOARhpO3W3o9H35e2miMCY00FbaM4Jha"
const SECRET_KEY = "sk_test_51ICkQ3Koy0nW0rNuyUXuevml6tnMab3ykOeRmZVCwlKK4b7o65DnZD0ZdHe2P3uRuzF1gyIfF8AXmYCzSVkrwN5V00aQkhdHsr"
const stripe = require('stripe')(SECRET_KEY)

router.use(csrfProtection)

router.get('/', (req, res) => {
    res.render('home', {
        'layout': 'basic'
    });
})

router.get('/confirm', (req, res) => {
    res.send("Arigato!")
})



















router.get('/menu', async(req, res) => {
    try {
        products = await Product.find().lean()
        console.log(products)
        res.render('menu', {
            'layout': 'basic',
            'products': products
        })
    } catch (err) {
        console.error(err)
    }
})

router.get('/menu/:sortby', async(req, res) => {
    try {
        if (req.params.sortby == 1) {
            console.log("Hii");
        }
        products = await Product.find().sort({ name: -1 }).lean()
        console.log(products)
        res.render('menu', {
            'layout': 'basic',
            'products': products,
            'sortby': req.params.sortby
        })
    } catch (err) {
        console.error(err)
    }
})

































router.get('/table', (req, res, next) => {
    res.render('table', {
        csrfToken: req.csrfToken(),
        'layout': 'basic',
        key: PUBLISHABLE_KEY,
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

// table.save((error, data) => {
//     if (error) {
//         console.log(error)
//     }
//     if (data) {
//         console.log(data)
//     }
// })

router.get('/checkout/:table', (req, res, next) => {
    // if (req.table.persons > 0) {
    //     return res.send('Hii');
    // }
    // var cart = new Cart(req.session.cart);
    var amount = 100;
    var errMsg = req.flash('error')[0];
    res.render('checkout', { total: amount, errMsg: errMsg, noError: !errMsg, csrfToken: req.csrfToken() });
});

router.post('/checkout/', (req, res, next) => {
    // if (!req.session.cart) {
    //     return res.send('HiiByw');
    // }
    // var cart = new Cart(req.session.cart);

    var stripe = require("stripe")(
        "sk_test_51ICkQ3Koy0nW0rNuyUXuevml6tnMab3ykOeRmZVCwlKK4b7o65DnZD0ZdHe2P3uRuzF1gyIfF8AXmYCzSVkrwN5V00aQkhdHsr"
    );

    stripe.charges.create({
        amount: 100 * 100,
        currency: "usd",
        source: req.body.stripeToken, // obtained with Stripe.js
        description: "Test Charge"
    }, function(err, charge) {
        if (err) {
            console.log("Hii")
            console.log(err)
            req.flash('error', err.message);
            return res.redirect('/checkout/:table');
        }
        var order = new Order({
            user: req.user,
            cart: cart,
            address: req.body.address,
            name: req.body.name,
            paymentId: charge.id
        });
        order.save(function(err, result) {
            req.flash('success', 'Successfully bought product!');
            req.session.cart = null;
            res.redirect('/');
        });
    });
});

router.get('/cart', (req, res) => {
    res.send("hiii")
})

router.post('/cart', async(req, res) => {
    let recID = req.body.proid
    const product = Product.find({ "_id": recID })
    const cartItem = new CartItem({ "product": product })

    cartItem.save((err, data) => {
        if (err) {
            console.log(err)
        } else {
            console.log(data)
        }
    })
})

module.exports = router