const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const connectDB = require("./config/db")
const path = require('path')
const dotenv = require('dotenv')
const exphbs = require('express-handlebars')
const passport=require('passport')

// This simply sets the environment file  
dotenv.config({ path: './config/config.env' })

// Database Connection
connectDB()

const app = express()

// This is used to get the data from the body 
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// This sets the engine to .hbs
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', '.hbs')

// This sets the static folder
app.use(express.static(path.join(__dirname, 'public')))

// Setting up the routes
app.use('/', require('./routes/index'))

// This sets the port
const port = process.env.PORT || 5000
app.listen(port, console.log(`Server running on PORT: ${port}`))