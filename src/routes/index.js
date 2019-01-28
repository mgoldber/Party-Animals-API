import express from 'express';
import config from '../config';
import middleware from '../middleware';
import initializeDb from '../db';
import venue from '../controller/venue';

let router = express();

// connect to the db
initializeDb(db => {

	// internal middleware
	router.use(middleware({ config, db }));

	// api routes v1 (/v1)
	router.use('/venue', venue({ config, db }));
});

export default router;