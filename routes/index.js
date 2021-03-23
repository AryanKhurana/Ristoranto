const express = require('express')
const router = express.Router()
const Product = require('../models/Product')
const Table = require('../models/Table')
const User = require('../models/User')
const moment = require('moment')
const { check, validationResult } = require('express-validator')
const CartItem = require('../models/CartItem')
const tables = 20
const fetch = require("node-fetch");
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const stripe = require('stripe')('sk_test_51ICkQ3Koy0nW0rNuyUXuevml6tnMab3ykOeRmZVCwlKK4b7o65DnZD0ZdHe2P3uRuzF1gyIfF8AXmYCzSVkrwN5V00aQkhdHsr');

router.get('/', (req, res) => {
    console.log(__dirname);
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
        console.log(req.user)
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
    var products = []
    cartItem = await CartItem.find({ user: req.user }).lean()
    for (let i = 0; i < cartItem.length; i++) {
        product = await Product.find({ _id: cartItem[i].product })
        products.push(product)
    }
    console.log(products)
    if (products.length) {
        for (var i = 0; i < products.length; i++) {
            CartItem.deleteOne({ product: products[i], user: req.user }, function(err) {
                if (err) console.log(err);
            });
        }

    } else {
        return res.redirect('/')
    }
    res.redirect('/')
})


// BOok table
router.get('/table', (req, res) => {
    res.render('table', {
        'layout': 'basic',
        
    })
})
roter.use(function(req, res, next) {
    res.status(404);
    res.render('404', {
        'layout': 'basic',
        
    })
   
});

router.get('/tableDetails/:date/:time', async(req, res) => {
    console.log("----------------------------------------------------------------------------------")
    const _tables = await Table.find({ "date": new Date(req.params.date), "time": req.params.time }, (err) => {
        if (err) {
            console.log(err)
        }
    }).lean()

    console.log(_tables)
    console.log("------------------------------------------------------------")
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
            // res.redirect('/')
        }
    })
    res.redirect('/')
})

router.post('/create-checkout-session', async(req, res) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'INR',
                product_data: {
                    name: req.body.productName,
                    images: req.body.images,
                },
                unit_amount: req.body.amount,
            },
            quantity: req.body.quantity,
        }, ],
        mode: 'payment',
        success_url: req.body.success_url,
        cancel_url: 'http://localhost:3000/',
    });
    res.json({ id: session.id });
});


// Remove all tables from the database before this day
setInterval(async() => {
    var date = new Date.getDate() + "-" + new Date.getMonth + "-" + new Date.getYear();
    const _tables = await Table.find({ time: new Date.getHours(), date: date }).lean();
    if (_tables.length) {
        table.deleteOne({ _id: _tables[0]._id });
    }
}, 3600000)


module.exports = router