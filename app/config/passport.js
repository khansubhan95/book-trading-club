var mongoose = require('mongoose')
var LocalStrategy = require('passport-local').Strategy

var userSchema = require('../models/users')
var profileSchema = require('../models/profiles')

var User = mongoose.model('User', userSchema)
var Profile = mongoose.model('Profile', profileSchema)

module.exports = function(passport) {
	passport.serializeUser(function(user, done){
		done(null, user.id)
	})

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user)
		})
	})

	passport.use('local-signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true,
	},
	function(req, email, password, done) {
		process.nextTick(function(){
			User.findOne({'local.email': email}, function(err, user){
				if (err) return done(err)

				if (user) return done(null, false)

				else {
					var newUser = new User();

					newUser.local.email = email;
					newUser.local.password = newUser.generateHash(password)
					newUser.profile.fullName = ''
					newUser.profile.city = ''
					newUser.profile.state = ''

					newUser.save(function(err, doc) {
						if (err) console.log(err);
						return done(null, newUser)
					})
				}
			})
		})
	}
	))

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true,
	},
	function(req, email, password, done) {
		process.nextTick(function(){
			User.findOne({'local.email': email}, function(err, user){
				if (err) return done(err)

				if (!user) return done(null, false)
				
				return done(null, user)
			})
		})
	}
	))
}