const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const Table = require('../models/Table')
const User = require('../models/User')
const moment = require('moment')
const querystring = require('querystring');
const { check, validationResult } = require('express-validator')
const CartItem = require('../models/CartItem')
const tables = 20
const fetch = require("node-fetch");
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const stripe = require('stripe')('sk_test_51ICkQ3Koy0nW0rNuyUXuevml6tnMab3ykOeRmZVCwlKK4b7o65DnZD0ZdHe2P3uRuzF1gyIfF8AXmYCzSVkrwN5V00aQkhdHsr');

router.get('/', (req, res) => {
    res.render('home', {
        'layout': 'basic',
        user: req.user
    });
})

router.get('/login', ensureGuest, (req, res) => {
    res.render('login', {
        'layout': 'basic'
    })
})

router.get('/logout', ensureAuth, (req, res) => {
    req.logout()
    res.redirect('/login')
})

router.get('/cart', ensureAuth, async(req, res) => {
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
            'user': req.user
        })
    } catch (err) {
        console.error(err + '***')
    }
})

router.get('/about', function(req, res) {
    res.render('ristoranto', {
        'layout': 'basic',
        'user': req.user
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
            'user': req.user
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
            res.redirect('/cart')
        });

    } else {
        return res.redirect('/cart')
    }

})

router.get('/removeAllCartItems', ensureAuth, async(req, res) => {

    var qProducts = JSON.parse(req.query['products']);
    var ids = []
    for (var i = 0; i < qProducts.length; i++) {
        if (qProducts[i]._id != "") {
            ids.push(qProducts[i]._id);
        }
    }

    var products = []
    var cartItems = []

    for (let i = 0; i < ids.length; i++) {
        product = await Product.find({ _id: ids[i] })
        products.push(product[0])
    }

    for (let i = 0; i < products.length; i++) {
        cartItem = await CartItem.find({ user: req.user, product: products[i] }).lean()
        cartItems.push(cartItem[0])
    }

    if (cartItems.length == ids.length && ids.length) {

        for (let i = 0; i < cartItem.length; i++) {
            product = await Product.find({ _id: cartItem[i].product })
            products.push(product[0])
        }

        if (products.length) {
            for (var i = 0; i < products.length; i++) {
                CartItem.deleteOne({ product: products[i], user: req.user }, function(err) {
                    if (err) console.log(err);
                });
            }
        } else {
            return res.redirect('/')
        }
        qString = querystring.stringify({ 'products': JSON.stringify(qProducts) })
        res.redirect('/success?' + qString)
    }
})

router.get('/success', (req, res) => {
    var products = JSON.parse(req.query['products']);
    products.pop()
    var date = new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear();
    res.render('success', {
        'layout': 'basic',
        'products': products,
        'user': req.user.displayName,
        "date": date
    })
})


// BOok table
router.get('/table', (req, res) => {
    res.render('table', {
        'layout': 'basic',
    })
})

// router.use(function(req, res, next) {
//     res.status(404);
//     res.render('404', {
//         'layout': 'basic',

//     })
// });

router.get('/tableDetails/:date/:time', async(req, res) => {
    const _tables = await Table.find({ "date": new Date(req.params.date), "time": req.params.time }, (err) => {
        if (err) {
            console.log(err)
        }
    }).lean()

    res.json({
        table: _tables.length,
    });
});

router.get('/saveTables', (req, res) => {
    _table = new Table({ firstName: req.query.firstName, lastName: req.query.lastName, email: req.query.email, persons: req.query.persons, date: req.query.date, time: req.query.time })
    _table.save((error, data) => {
        if (error) {
            console.log(error)
        }
        if (data) {
            console.log(data);
        }
    })

    res.redirect(`/tableSuccess?id=${_table._id}`)
})

router.get('/tableSuccess', async(req, res) => {
    const tables = await Table.find({ _id: req.query.id }).lean()
    if (tables.length != 0) {
        var date = new Date(tables[0].date).getDate() + "/" + (new Date(tables[0].date).getMonth() + 1) + "/" + new Date(tables[0].date).getFullYear();
        res.render('tableSuccess', {
            'layout': 'basic',
            'table': tables[0],
            'date': date
        })
    } else {
        res.redirect('/')
    }
})

router.post('/create-checkout-session', async(req, res) => {
    var _lineItems = []
    var queriesList = []
    for (var i = 0; i < req.body.images.length; i++) {
        _lineItems.push({
            price_data: {
                currency: 'INR',
                product_data: {
                    name: req.body.name[i],
                    images: [req.body.images[i]],
                },
                unit_amount: req.body.amount[i],
            },
            quantity: req.body.quantity[i],
        })

        if (req.body.name[i] != "Book A Table") {

            queriesList.push({
                _id: req.body.ids[i],
                price_data: {
                    currency: 'INR',
                    product_data: {
                        name: req.body.name[i],
                        images: [req.body.images[i]],
                    },
                    unit_amount: req.body.amount[i],
                },
                quantity: req.body.quantity[i],
            })
        }
    }

    if (queriesList.length != 0) {
        qString = querystring.stringify({ 'products': JSON.stringify(queriesList) })
    } else {
        qString = ""
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: _lineItems,
        mode: 'payment',
        success_url: req.body.success_url + qString,
        cancel_url: req.body.cancel_url,
    });
    res.json({ id: session.id });
});


// Remove all tables from the database before this day
setInterval(async() => {
    var date = new Date().getDate() + "/" + new Date().getMonth() + "/" + new Date().getFullYear();
    const _tables = await Table.find({ time: { $lt: new Date().getHours() }, date: { $lt: new Date() } }).lean();
    if (_tables.length) {
        Table.deleteOne({ _id: _tables[0]._id }, function(err) {
            if (err) console.log(err);
        });
    }
}, 36000000)


module.exports = router