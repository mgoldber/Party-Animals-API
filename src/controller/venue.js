import mongoose from 'mongoose';
import { Router } from 'express';
import Venue from '../model/venue';
import Review from '../model/review';

import { authenticate } from '../middleware/authMiddleware';

export default({ config, db }) => {
	let api = Router();

	// '/v1/venue/add'
	api.post('/add', authenticate, (req, res) => {
		let newVenue = new Venue();
		newVenue.name = req.body.name;
		newVenue.venuetype = req.body.venuetype;
		newVenue.geometry.coordinates = req.body.geometry.coordinates;

		newVenue.save(err => {
			if (err) {
				res.send(err);
			}
			res.json({ message: 'Venue saved successfully' });
		});
	});

	// '/v1/venue/' - READ all venues
	api.get('/', (req, res) => {
		Venue.find({}, (err, venues) => {
			if (err) {
				res.send(err);
			}
			res.json(venues);
		});
	});

	// '/v1/venue/:id' - READ one venue
	api.get('/:id', (req, res) => {
		Venue.findById(req.params.id, (err, venue) => {
			if (err) {
				res.send(err);
			}
			res.json(venue);
		});
	});

	// '/v1/venue/:id' - UPDATE
	api.put('/:id', (req, res) => {
		Venue.findById(req.params.id, (err, venue) => {
			if (err) {
				res.send(err);
			}
			venue.name = req.body.name;
			venue.save(err => {
				res.send(err);
			});
			res.json({ message: "Venue info updated" });
		});
	});

	// '/v1/venue/:id' - DELETE
	api.delete('/:id', (req, res) => {
		Venue.remove({
			_id: req.params.id
		}, (err, venue) => {
			if (err) {
				res.send(err);
			}
			res.json({ message: "Venue successfully removed" });
		});
	});

	// add review for specific venue id
	// '/v1/venue/reviews/add/:id'
	api.post('/reviews/add/:id', (req, res) => {
		Venue.findById(req.params.id, (err, venue) => {
			if (err) {
				res.send(err);
			}
			let newReview = new Review();

			newReview.title = req.body.title;
			newReview.text = req.body.text;
			newReview.venue = venue._id;
			newReview.save((err, review) => {
				if (err) {
					res.send(err);
				}
				venue.reviews.push(newReview);
				venue.save(err => {
					if (err) {
						res.send(err);
					}
					res.json({ message: 'Venue review saved' });
				});
			});
		});
	});

	// get reviews for specific venue id
	// '/v1/venue/reviews/:id'
	api.get('/reviews/:id', (req, res) => {
		Review.find({venue: req.params.id}, (err, reviews) => {
			if (err) {
				res.send(err);
			}
			res.json(reviews);
		});
	});

	return api;
}
