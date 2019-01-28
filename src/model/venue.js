import mongoose from 'mongoose';
import Review from './review';
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
	geometry: {
		type: { type: String, default: 'Point' },
		coordinates: [Number]
	},
	reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
});

module.exports = mongoose.model('Venue', VenueSchema);