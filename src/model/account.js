import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

let Account = new Schema({
	email: String,
	password: String,
	isVerified: { type: Boolean, default: false },
	isAdmin: { type: Boolean, default: false },
	resetPasswordToken: String
});

Account.plugin(passportLocalMongoose);
module.exports = mongoose.model('Account', Account);
