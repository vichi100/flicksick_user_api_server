const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const utilSchema = new Schema({
	genres: {},
	years: [],
	category: []
});

module.exports = mongoose.model('Util', utilSchema);
