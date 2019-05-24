var mongoose = require('mongoose')

var profileSchema = new mongoose.Schema({
	email: String,
	fullname: String,
	city: String,
	state: String
})

module.exports = profileSchema