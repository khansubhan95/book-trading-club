var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

var userSchema = new mongoose.Schema({
	local: {
		email: String,
		password: String
	},
	profile: {
		fullName: String,
		city: String,
		state: String
	}
})

userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(9))
}

userSchema.methods.comparePasswords = function(password) {
	return bcrypt.compareSync(password, this.local.password)
}

module.exports = userSchema