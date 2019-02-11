import mongoose from 'mongoose';
import Venue from './venue';
let Schema = mongoose.Schema;

let AnimalSchema = new Schema ({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  type: String,
  dance: String,
  venue: {
    type: Schema.Types.ObjectId,
    ref: 'Venue',
    required: true
  }
});

module.exports = mongoose.model('Animal', AnimalSchema);
