const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieRatingSchema = new Schema({
	fs_id: String,
	loved_it: { type: Number, default: 0 },
	dumb_but_entertaining: { type: Number, default: 0 },
	just_time_pass: { type: Number, default: 0 },
	worthless: { type: Number, default: 0 },
	total_votes: { type: Number, default: 0 }
});

module.exports = mongoose.model('movie_rating', movieRatingSchema);
