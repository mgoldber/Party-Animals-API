import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import passportLocalMongoose from 'passport-local-mongoose';

let Token = new Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Account'},
  token: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now, expires: 43200}
});

module.exports = mongoose.model('Token', Token);
