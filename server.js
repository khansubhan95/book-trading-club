var express = require('express')
var path = require('path')
var session = require('express-session')
var passport = require('passport')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')

var routes = require('./app/routes/index')

var app = express()

require('dotenv').config()

mongoose.connect(process.env.MONGO_URI)
mongoose.Promise = global.Promise

require('./app/config/passport')(passport)

app.use(express.static('./static'))
app.use(bodyParser())
app.use(session({
	secret: 'book-club',
	saveUninitialized: true,
	resave: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'app/views'))

routes(app, passport)

app.listen(process.env.PORT||3000)
console.log('Server running on port 3000');