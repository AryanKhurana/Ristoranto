const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const connectDB = require("./config/db")
const path = require('path')
const dotenv = require('dotenv')
const exphbs = require('express-handlebars')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const fetch = require("node-fetch");


// This simply sets the environment file  
dotenv.config({ path: './config/config.env' })

require('./config/passport')(passport);

// Database Connection
connectDB()

const app = express()

// This is used to get the data from the body 
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const { sortBySelect } = require('./helpers/hbs')

// This sets the engine to .hbs
app.engine('.hbs', exphbs({
    helpers: {
        sortBySelect,
    },
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', '.hbs')

// Sessions
app.use(session({
    secret: 'dfssjlakjlkja',
    resave: false,
    saeUninitiated: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

// Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// This sets the static folder
app.use(express.static(path.join(__dirname, 'public')))

// Setting up the routes
app.use('/', require('./routes/index'))
app.use('/admin', require('./routes/admin'))
app.use('/auth', require('./routes/auth'))

// This sets the port
const port = process.env.PORT || 5000
app.listen(port, console.log(`Server running on PORT: ${port}`))