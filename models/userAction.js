const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActionSchema = new Schema({
	id: String, // user id
	mobile: String,
	country: String,
	already_seen: {}, // {fs_id: y/n} y: yes, n:no
	rating: {}, // {fs_id: rating_code} // loved it: 0, dumb but entertaining: 1, just time pass: 2, worthless: 3
	not_interested: {} // {fs_id: rating_code}
});

module.exports = mongoose.model('user_action', userActionSchema);
