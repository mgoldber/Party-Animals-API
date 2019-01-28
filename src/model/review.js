import mongoose from 'mongoose';
import Venue from './venue';
let Schema = mongoose.Schema;

let ReviewSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	text: String,
	venue: {
		type: Schema.Types.ObjectId,
		ref: 'Venue',
		required: true
	}
});

module.exports = mongoose.model('Review', ReviewSchema);