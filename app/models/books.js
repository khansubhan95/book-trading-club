var mongoose = require('mongoose')

var bookSchema = new mongoose.Schema({
	title: String,
	owner: String,
	cover: String,
	requested: {
		type: Boolean,
		default: false
	},
	accepted: {
		type: Boolean,
		default: false
	}
})

module.exports = bookSchema