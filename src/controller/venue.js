import mongoose from 'mongoose';
import { Router } from 'express';
import Venue from '../model/venue';
import Account from '../model/account';
import Review from '../model/review';
import Animal from '../model/animal';

import { authenticate } from '../middleware/authMiddleware';

export default({ config, db }) => {
	let api = Router();

	// '/v1/venue/add'
	api.post('/add', authenticate, (req, res) => {
		let newVenue = new Venue();
		newVenue.name = req.body.name;
		newVenue.venuetype = req.body.venuetype;
		newVenue.image = req.body.image;
		if (req.body.geometry) {
			newVenue.geometry.coordinates = req.body.geometry.coordinates;
		}
		Account.findById(req.user.id, (err, user) => {
			if (user.isAdmin) {
				newVenue.save(err => {
					if (err) {
						res.send(err);
					}
					res.json({ message: 'Venue saved successfully' });
				});
			} else {
				res.json({ message: 'User is not administrator' });
			}
		});
	});

	// '/v1/venue/' - READ all venues
	api.get('/', authenticate, (req, res) => {
		Venue.find({}, (err, venues) => {
			if (err) {
				res.send(err);
			}
			res.json(venues);
		});
	});

	// '/v1/venue/:id' - READ one venue
	api.get('/:id', authenticate, (req, res) => {
		Venue.findById(req.params.id, (err, venue) => {
			if (err) {
				res.send(err);
			}
			res.json(venue);
		});
	});

	// '/v1/venue/:id' - UPDATE
	api.put('/:id', authenticate, (req, res) => {
		Venue.findById(req.params.id, (err, venue) => {
			if (err) {
				res.send(err);
			}
			venue.name = req.body.name;
			venue.image = req.body.image;
			venue.venuetype = req.body.venuetype;
			if (req.body.geometry) {
				newVenue.geometry.coordinates = req.body.geometry.coordinates;
			}

			Account.findById(req.user.id, (err, user) => {
				if (user.isAdmin) {
					venue.save(err => {
						res.send(err);
					});
					res.json({ message: 'Venue info updated' });
				} else {
					res.json({ message: 'User is not administrator' });
				}
			});
		});
	});

	// '/v1/venue/:id' - DELETE
	api.delete('/:id', authenticate, (req, res) => {
		Account.findById(req.user.id, (err, user) => {
			if (user.isAdmin) {
				Venue.remove({
					_id: req.params.id
				}, (err, venue) => {
					if (err) {
						res.send(err);
					}
					res.json({ message: "Venue successfully removed" });
				});
			} else {
				res.json({ message: 'User is not administrator' });
			}
		});
	});

	// add review for specific venue id
	// '/v1/venue/reviews/add/:id'
	api.post('/reviews/add/:id', authenticate, (req, res) => {
		Venue.findById(req.params.id, (err, venue) => {
			if (err) {
				res.send(err);
			}
			let newReview = new Review();

			newReview.title = req.body.title;
			newReview.text = req.body.text;
			newReview.venue = venue._id;

			Account.findById(req.user.id, (err, user) => {
				if (user.isAdmin) {
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
				} else {
					res.json({ message: 'User is not administrator' });
				}
			});
		});
	});

	// get reviews for specific venue id
	// '/v1/venue/reviews/:id'
	api.get('/reviews/:id', authenticate, (req, res) => {
		Review.find({venue: req.params.id}, (err, reviews) => {
			if (err) {
				res.send(err);
			}
			res.json(reviews);
		});
	});

	// add animal for specific venue id
	// '/v1/venue/animals/add/:id'
	api.post('/animals/add/:id', authenticate, (req, res) => {
		Venue.findById(req.params.id, (err, venue) => {
			if (err) {
				res.send(err);
			}
			let newAnimal = new Animal();

			newAnimal.name = req.body.name;
			newAnimal.image = req.body.image;
			newAnimal.type = req.body.type;
			newAnimal.dance = req.body.dance;
			newAnimal.venue = venue._id;

			Account.findById(req.user.id, (err, user) => {
				if (user.isAdmin) {
					newAnimal.save((err, animal) => {
						if (err) {
							res.send(err);
						}
						venue.animals.push(newAnimal);
						venue.save(err => {
							if (err) {
								res.send(err);
							}
							res.json({ message: 'Venue animal saved' });
						});
					});
				} else {
					res.json({ message: 'User is not administrator' });
				}
			});
		});
	});

	// get animals for specific venue id
	// '/v1/venue/animals/:id'
	api.get('/animals/:id', authenticate, (req, res) => {
		Animal.find({venue: req.params.id}, (err, animals) => {
			if (err) {
				res.send(err);
			}
			res.json(animals);
		});
	});

	return api;
}
