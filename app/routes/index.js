var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var request = require('request')

var userSchema = require('../models/users')
var profileSchema = require('../models/profiles')
var bookSchema = require('../models/books')
var transactionSchema = require('../models/transactions')

var User = mongoose.model('User', userSchema)
var Profile = mongoose.model('Profile', profileSchema)
var Book = mongoose.model('Book', bookSchema)
var Transaction = mongoose.model('Transaction', transactionSchema)

var urlencodedParser = bodyParser.urlencoded({extended:false})


module.exports = function(app, passport) {
	app.get('/', function(req, res){
		if (req.isAuthenticated()) {
			console.log('reached here');
			Book.find({requested: false, accepted: false}, function(err, doc) {
				if (err) console.log(err);
				var books = doc.filter(function(obj) {
					return obj.owner !== req.user.local.email
				})
				res.render('list', {'counter': req.isAuthenticated(), 'books': books})
			})
		}
		else {
			res.render('list', {'counter': false})
		}
	})

	app.get('/login', function(req, res) {
		if (req.isAuthenticated())
			res.redirect('/')
		res.render('login', {counter: req.isAuthenticated()})
	})

	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/profile',
		failureRedirect: '/login'
	}))

	app.get('/signup', function(req, res) {
		res.render('signup', {'counter': req.isAuthenticated()})
	})

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup'
	}))

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile', {'user': req.user, counter: req.isAuthenticated()})
	})

	app.post('/profile', urlencodedParser, function(req, res) {
		var data = {
			profile: {
				'fullName': req.body.fullName,
				'city': req.body.city,
				'state': req.body.state,
			}
		};

		User.findOneAndUpdate({'local.email': req.user.local.email}, data, {upsert: true}, function(err, doc) {
			if (err) console.log(err);
			console.log('Data updated successfully');
			res.redirect('/profile')
		})
	})

	app.get('/mybooks', isLoggedIn, function(req, res) {
		Book.find({'owner': req.user.local.email}, function(err, doc) {
			var books = doc
			Transaction.find({$or:[{'owner': req.user.local.email}, {'requester': req.user.local.email}]}, function(err, doc) {
					var rEmail = req.user.local.email
					var dok = doc
					var pending = dok.filter(function(obj) {
						return (obj.requester !== rEmail && !obj.accepted)
					})
					var requested = dok.filter(function(obj) {
						return (obj.requester === rEmail && !obj.accepted)
					})
					var userAccepted = dok.filter(function(obj) {
						return (obj.requested && obj.accepted && obj.requester !== rEmail)
					})
					var otherAccepted = dok.filter(function(obj) {
						return (obj.requested && obj.accepted && obj.requester === rEmail)
					})
					res.render('mybooks', {'counter': true, 'books': books, 'pending': pending, 'requested': requested, 'userAccepted': userAccepted, 'otherAccepted': otherAccepted})
				})
		})
	})

	app.post('/mybooks', isLoggedIn, urlencodedParser, function(req, res) {
		var bookName = req.body.book
		var APIEndPoint = 'https://www.googleapis.com/books/v1/volumes?q=' + encodeURIComponent(bookName) + '&maxResults=5&key=' + process.env.GOOGLE_API_KEY
		request.get(APIEndPoint, function(err, response, body) {
			if (!err && response.statusCode===200) {
				body = JSON.parse(body)
				var book = body.items[0]
				var newBook = new Book()
				newBook.title = book.volumeInfo.title
				newBook.owner = req.user.local.email
				newBook.cover = book.volumeInfo.imageLinks.thumbnail
				newBook.save(function(err, doc) {
					if(err) console.log(err);

					res.redirect('/mybooks')
				})
			}
		})
	})

	app.get('/logout', isLoggedIn, function(req, res) {
		req.logout()
		res.redirect('/')
	})

	app.get('/api/books/delete/:id', isLoggedIn, function(req, res) {
		var id = req.params.id
		Book.findOne({'_id': id}, function(err, doc) {
			if (err) console.log(err);
			if (req.user.local.email !== doc.owner) {
				res.redirect('/')
			}

			else {
				Book.remove({'_id': id}, function(err, doc) {
					if (err) console.log(err);

					res.redirect('/mybooks')
				})
			}
		})
	})

	app.get('/api/books/request/:id', isLoggedIn, function(req, res) {
		var id = req.params.id
		Book.findOne({'_id': id}, function(err, doc) {
			if (err) console.log(err);

			if(doc.owner === req.user.local.email) res.redirect('/')

			else {
				Book.findOneAndUpdate({'_id': id}, {'requested': true}, {upsert: true}, function(err, doc) {
					if (err) console.log(err);
					var newTransaction = new Transaction()
					newTransaction.title = doc.title
					newTransaction.cover = doc.cover
					newTransaction.owner = doc.owner
					newTransaction.requester = req.user.local.email
					newTransaction.bookId = doc['_id']
					newTransaction.save(function(err, doc) {
						if (err) console.log(err);

						res.redirect('/mybooks')
					})
				})
			}
		})
	})

	app.get('/api/books/accept/:id', isLoggedIn, function(req, res) {
		var id = req.params.id
		Book.findOne({'_id': id}, function(err, doc) {
			if (err) console.log(err);

			if(doc.owner !== req.user.local.email) res.redirect('/')

			else {
				Book.findOneAndUpdate({'_id': id}, {'accepted': true}, {upsert: true}, function(err, doc) {
					if (err) console.log(err);
					
					Transaction.findOneAndUpdate({'bookId': id}, {'accepted': true}, {upsert: true}, function(err, doc) {
						if (err) console.log(err);
						res.redirect('/mybooks')
					})
				})
			}
		})
	})

	app.get('/api/books/reject/:id', isLoggedIn, function(req, res) {
		var id = req.params.id
		Book.findOne({'_id': id}, function(err, doc) {
			if (err) console.log(err);

			if(doc.owner !== req.user.local.email) res.redirect('/')

			else {
				Book.findOneAndUpdate({'_id': id}, {'requested': false}, {upsert: true}, function(err, doc) {
					if (err) console.log(err);
					
					Transaction.remove({'bookId': id}, function(err, doc) {
						if (err) console.log(err);

						res.redirect('/')
					})
				})
			}
		})
	})
}

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next()
	res.redirect('/')
}