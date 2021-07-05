const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	id: String,
	expo_token: String,
	name: String,
	country: String,
	mobile: String,
	create_date_time: Date,
	update_date_time: Date
});

module.exports = mongoose.model('User', userSchema);

// employees=[
//   { employee_id: String, employee_name: String, employee_mobile: String, access_rights:String}
// ]
