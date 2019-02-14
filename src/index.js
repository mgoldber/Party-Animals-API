import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();

import config from './config';
import routes from './routes';

var cors = require('cors');

let app = express();
app.use(cors())
app.server = http.createServer(app);

// middleware
// parse application/json
app.use(bodyParser.json({
	limit: config.bodyLimit
}));

// passport config
app.use(passport.initialize());
let Account = require('./model/account');
passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
},
	Account.authenticate()
));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// api routes v1
app.use('/v1', routes);

app.server.listen(config.port);
console.log(`Started on port ${app.server.address().port}`);

export default app;
