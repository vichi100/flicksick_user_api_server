const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const allUsersSchema = new Schema({
	id: String,
	users: {} // {mobile: name} friends list using app
});

module.exports = mongoose.model('all_users', allUsersSchema);
