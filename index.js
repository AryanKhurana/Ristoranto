const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')
const dotenv = require('dotenv')
const exphbs = require('express-handlebars')

dotenv.config({ path: './config/config.env' })

const app = express()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', '.hbs')

app.use(express.static(path.join(__dirname, 'public')))

mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Database Connected"))
.catch((err) => console.log(err))

app.use('/', require('./routes/index'))

const port = process.env.PORT || 5000

app.listen(port, console.log(`Server running on PORT: ${port}`))