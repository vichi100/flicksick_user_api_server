const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userContactsSchema = new Schema({
	id: String, // user id
	friends_on: {}, // {mobile: name} friends list using app
	friends_off: {}, // {mobile: name} friends list not using app
	friends_blocked: {}, // {mobile: name} friends list blocked by user
	invitation_sent: {},
	create_date_time: Date,
	update_date_time: Date
});

module.exports = mongoose.model('user_contacts', userContactsSchema);
