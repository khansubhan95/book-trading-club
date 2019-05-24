var mongoose = require('mongoose')

var transactionSchema = new mongoose.Schema({
	title: String,
	cover: String,
	owner: String,
	requester: String,
	bookId: String,
	requested: {
		type: Boolean,
		default: true
	},
	accepted: {
		type: Boolean,
		default: false
	}
})

module.exports = transactionSchema