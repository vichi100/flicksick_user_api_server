const express = require('express');
const bodyParser = require('body-parser');
var busboy = require('connect-busboy');
const mongoose = require('mongoose');
const path = require('path'); //used for file path
var uuid = require('uuid');
const { nanoid } = require('nanoid');
const axios = require('axios');
var ObjectId = require('mongodb').ObjectID;
const { MongoClient } = require('mongodb'); 
const Schema = mongoose.Schema;

// 2 Factor API
const OTP_API = 'd19dd3b7-fc3f-11e7-a328-0200cd936042';

const User = require('./models/user');
const UserAction = require('./models/userAction');
const MovieRating = require('./models/movieRating');
const UserContacts = require('./models/userContacts');
const AllUsers = require('./models/allUsers');
const Util = require('./models/util');
const Movie = require('./models/movie');

const app = express();
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	// res.header(
	//   "Access-Control-Allow-Methods",
	//   "GET,PUT,POST,DELETE,PATCH,OPTIONS"
	// );
	// res.header(
	//   //"Access-Control-Allow-Headers",
	//   "Origin, X-Requested-With, Content-Type, Accept"
	// );
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested With, Content-Type, Accept');

	next();
});

const USER_MOBILE_DICT = {};

// start: Connect to DB
// const dbURL = 'mongodb+srv://vichi:vichi123@cluster0.3gcit.mongodb.net/flixsee?retryWrites=true&w=majority'
// const dbURL = 'mongodb+srv://vichi:vichi123@cluster0.emt5x.mongodb.net/flicksick_india?retryWrites=true&w=majority';
const dbURL = 'mongodb://flicksick:flicksick123@209.145.57.26:27017/flicksick_india'
mongoose
	.connect(dbURL)
	.then(() => {
		// app.listen(6000 ,'0.0.0.0');
		app.listen(3070, '0.0.0.0', () => {
			console.log('server is listening on 3070 port');
			console.log('START: creating user dict');
			var timetaken = 'Time taken to create user dict';
			console.time(timetaken);
			User.find({}).then((result) => {
				console.log(result[0]);
				result.map((item) => {
					USER_MOBILE_DICT[item.mobile] = 'y';
				});
				console.log('END: creating user dict');
				console.timeEnd(timetaken);
				console.log('USER_MOBILE_DICT: ', JSON.stringify(USER_MOBILE_DICT));
			});
		});

		// console.log('MongoDB connected...server listening at 3000');
	})
	.catch((err) => console.log(err));

// end: Connect to DB

app.post('/getUserDetails', function(req, res) {
	console.log('getUserDetails');
	getUserDetails(req, res);
});

app.post('/generateOTP', function(req, res) {
	console.log('generateOTP');
	generateOTP(req, res);
});

app.post('/getFriendsData', function(req, res) {
	console.log('getFriendsData');
	getFriendsData(req, res);
});

app.post('/sendInvitation', function(req, res) {
	console.log('sendInvitation');
	sendInvitation(req, res);
});

app.post('/saveNewContact', function(req, res) {
	console.log('saveNewContact');
	saveNewContact(req, res);
});

app.post('/updateName', function(req, res) {
	console.log('updateName');
	updateName(req, res);
});

const updateName = (req, res) => {
	console.log(JSON.stringify(req.body));
	const obj = JSON.parse(JSON.stringify(req.body));
	const name = obj.name;
	const mobile = obj.mobile;
	User.updateOne({ mobile: mobile }, { $set: { name: name } })
		.then((result) => {
			res.send(JSON.stringify('success'));
			res.end();
			return;
		})
		.catch((err) => {
			console.error(`generateOTP# Failed to fetch documents : ${err}`);
			res.send(JSON.stringify('fail'));
			res.end();
			return;
		});
};

const generateOTP = (req, res) => {
	console.log(JSON.stringify(req.body));
	const obj = JSON.parse(JSON.stringify(req.body));
	const mobile = obj.mobile;
	const OTP = obj.otp;

	axios
		.get(`https://2factor.in/API/V1/${OTP_API}/SMS/${mobile}/${OTP}/FlickSickOTP1`)
		.then((response) => {
			// console.log(response);
			res.send(JSON.stringify('success'));
			res.end();
			// console.log('response sent');
			return;
		})
		.catch((err) => {
			console.error(`generateOTP# Failed to fetch documents : ${err}`);
			res.send(JSON.stringify('fail'));
			res.end();
			return;
		});
};

const sendInvitation = (req, res) => {
	const obj = JSON.parse(JSON.stringify(req.body));
	console.log(JSON.parse(JSON.stringify(req.body)));
	const inviteeName = obj.invitee_name;
	const inviteeMobile = obj.invitee_mobile;
	const userMobile = obj.user_mobile;
	const addKey = 'invitation_sent.' + inviteeMobile;
	const removeKey = 'friends_off.' + inviteeMobile;
	UserContacts.collection
		.updateOne({ id: userMobile }, { $set: { [addKey]: inviteeName } })
		.then((result) => {
			UserContacts.collection
				.updateOne({ id: userMobile }, { $unset: { [removeKey]: inviteeName } })
				.then((result1) => {
					res.send('success');
					res.end();
					return;
				})
				.catch((err) => {
					console.error(`sendInvitation1 # Failed to insert data in UserContacts: ${err}`);
					res.send(JSON.stringify('fail'));
					res.end();
					return;
				});
		})
		.catch((err) => {
			console.error(`sendInvitation # Failed to insert data in UserContacts: ${err}`);
			res.send(JSON.stringify('fail'));
			res.end();
			return;
		});

	// send sms to user with link to download app
};

const getFriendsData = (req, res) => {
	const obj = JSON.parse(JSON.stringify(req.body));
	console.log(JSON.parse(JSON.stringify(req.body)));
	const user_id = obj.id;
	UserContacts.findOne({ id: user_id })
		.then((result) => {
			if (result) {
				res.send(JSON.stringify(result));
				res.end();
				return;
			} else {
				res.send(JSON.stringify({}));
				res.end();
				return;
			}
		})
		.catch((err) => {
			console.error(`getFriendsData # Failed to fetch data from UserContacts: ${err}`);
			res.send(JSON.stringify('fail'));
			res.end();
			return;
		});
};

const saveNewContact = (req, res) => {
	const obj = JSON.parse(JSON.stringify(req.body));
	// console.log(JSON.parse(JSON.stringify(req.body)));
	const user_id = obj.id;
	const contacts = obj.contact_dict;
	UserContacts.findOne({ id: user_id }).then((result) => {
		if (result) {
			console.log('1');
			// console.log('contacts: ', result);
			const friendsOffDict = result.friends_off;
			const friendsOnDict = result.friends_on;
			const friendsBlockedDict = result.friends_blocked;
			const invitationSentDict = result.invitation_sent;
			const finalDict = { ...friendsOffDict, ...friendsOnDict, ...friendsBlockedDict };
			const diffsDict = diff(contacts, finalDict);
			const tempFriendsOff = { ...friendsOffDict, ...diffsDict };
			//TEST THIS BEFORE PROD
			// add new added user in friends_on
			const friendsOnContactDict = {};
			Object.keys(tempFriendsOff).map((mobile) => {
				// console.log('USER_MOBILE_DICT: ', JSON.stringify(USER_MOBILE_DICT));
				const x = USER_MOBILE_DICT[mobile.toString()];
				// console.log('x: ', JSON.stringify(x));
				if (x) {
					console.log('x: ', JSON.stringify(x));
					const user = contacts[mobile];
					console.log('user: ', JSON.stringify(user));
					friendsOnContactDict[mobile] = user;
					delete tempFriendsOff[mobile.toString()];
				}
			});

			const allFriendsOn = { ...friendsOnContactDict, ...friendsOnDict };
			const insertObj = {
				id: user_id,
				friends_off: tempFriendsOff,
				friends_on: allFriendsOn,
				friends_blocked: friendsBlockedDict,
				invitation_sent: invitationSentDict
			};
			UserContacts.collection
				.updateOne({ id: user_id }, { $set: { friends_off: tempFriendsOff, friends_on: allFriendsOn } })
				.then((result) => {
					console.log('2');
					res.send(JSON.stringify(insertObj));
					res.end();
					return;
				})
				.catch((err) => {
					console.error(`saveNewContact1 # Failed to insert documents in UserContacts: ${err}`);
					res.send(null);
					res.end();
					return;
				});
		} else {
			//check which contact or mobile is already present in DB
			console.log('3');
			const friendsOnContactDict = {};
			Object.keys(contacts).map((mobile) => {
				const x = USER_MOBILE_DICT[mobile];
				if (x) {
					const user = contacts[mobile];
					friendsOnContactDict[mobile] = user;
					delete contacts[mobile];
				}
			});

			const insertObj = {
				id: user_id,
				friends_off: contacts,
				friends_on: friendsOnContactDict,
				friends_blocked: {},
				invitation_sent: {}
			};
			UserContacts.collection
				.insertOne(insertObj)
				.then((result) => {
					console.log('4');
					res.send(JSON.stringify(insertObj));
					res.end();
					return;
				})
				.catch((err) => {
					console.error(`saveNewContact2 # Failed to insert documents in UserContacts: ${err}`);
					res.send(null);
					res.end();
					return;
				});
		}
	});
};

const getUserDetails = (req, res) => {
	const obj = JSON.parse(JSON.stringify(req.body));
	console.log(JSON.stringify(req.body));
	const mobileXX = obj.mobile;

	const countryCode = obj.country_code;
	User.findOne({ mobile: obj.mobile })
		.then((result) => {
			if (result) {
				res.send(JSON.stringify(result));
				res.end();
				return;
			} else {
				const userObj = {
					id: nanoid(),
					expo_token: '',
					name: null,
					country: obj.country,
					country_code: countryCode,
					mobile: obj.mobile,
					create_date_time: new Date(Date.now()),
					update_date_time: new Date(Date.now())
				};
				User.collection
					.insertOne(userObj)
					.then((result) => {
						console.log('1');

						USER_MOBILE_DICT[mobileXX] = 'y';
						res.send(JSON.stringify(userObj));
						res.end();
						return;
						// AllUsers.collection
						// 	.updateOne({ id: 'All_Users' }, { $set: { users: temp } }, { upsert: true })
						// 	.then((result) => {
						// 		res.send(JSON.stringify(userObj));
						// 		res.end();
						// 		return;
						// 	})
						// 	.catch((err) => {
						// 		console.error(`getUserDetails# Failed to insert documents in all_users: ${err}`);
						// 		res.send(JSON.stringify(null));
						// 		res.end();
						// 		return;
						// 	});
					})
					.catch((err) => {
						console.error(`getUserDetails# Failed to insert documents : ${err}`);
						res.send(JSON.stringify(null));
						res.end();
						return;
					});
			}
		})
		.catch((err) => {
			console.error(`getUserDetails# Failed to fetch documents : ${err}`);
			res.send(JSON.stringify(null));
			res.end();
			return;
		});
};

const diff = (obj1, obj2) => {
	// Make sure an object to compare is provided
	if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
		return obj1;
	}

	var diffs = {};
	var key;

	/**
     * Check if two arrays are equal
     * @param  {Array}   arr1 The first array
     * @param  {Array}   arr2 The second array
     * @return {Boolean}      If true, both arrays are equal
     */
	var arraysMatch = function(arr1, arr2) {
		// Check if the arrays are the same length
		if (arr1.length !== arr2.length) return false;

		// Check if all items exist and are in the same order
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}

		// Otherwise, return true
		return true;
	};

	/**
     * Compare two items and push non-matches to object
     * @param  {*}      item1 The first item
     * @param  {*}      item2 The second item
     * @param  {String} key   The key in our object
     */
	var compare = function(item1, item2, key) {
		// Get the object type
		var type1 = Object.prototype.toString.call(item1);
		var type2 = Object.prototype.toString.call(item2);

		// If type2 is undefined it has been removed
		if (type2 === '[object Undefined]') {
			diffs[key] = item1;
			return;
		}

		// If items are different types
		if (type1 !== type2) {
			diffs[key] = item2;
			return;
		}

		// If an object, compare recursively
		if (type1 === '[object Object]') {
			var objDiff = diff(item1, item2);
			if (Object.keys(objDiff).length > 0) {
				diffs[key] = objDiff;
			}
			return;
		}

		// If an array, compare
		if (type1 === '[object Array]') {
			if (!arraysMatch(item1, item2)) {
				diffs[key] = item2;
			}
			return;
		}

		// Else if it's a function, convert to a string and compare
		// Otherwise, just compare
		if (type1 === '[object Function]') {
			if (item1.toString() !== item2.toString()) {
				diffs[key] = item2;
			}
		} else {
			if (item1 !== item2) {
				diffs[key] = item2;
			}
		}
	};

	//
	// Compare our objects
	//

	// Loop through the first object
	for (key in obj1) {
		if (obj1.hasOwnProperty(key)) {
			compare(obj1[key], obj2[key], key);
		}
	}

	// Loop through the second object and find missing items
	for (key in obj2) {
		if (obj2.hasOwnProperty(key)) {
			if (!obj1[key] && obj1[key] !== obj2[key]) {
				diffs[key] = obj2[key];
			}
		}
	}

	// Return the object of differences
	return diffs;
};
