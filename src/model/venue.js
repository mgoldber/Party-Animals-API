import mongoose from 'mongoose';
import Review from './review';
import Animal from './animal';
let Schema = mongoose.Schema;

let VenueSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	venuetype: {
		type: String,
		required: true
	},
	image: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	geometry: {
		type: { type: String, default: 'Point' },
		coordinates: [Number]
	},
	reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],
	animals: [{type: Schema.Types.ObjectId, ref: 'Animal'}]
});

module.exports = mongoose.model('Venue', VenueSchema);
