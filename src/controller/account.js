import mongoose from 'mongoose';
import { Router } from 'express';
import Account from '../model/account';
import Token from '../model/token';
import bodyParser from 'body-parser';
import passport from 'passport';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import config from '../config';

const path = require('path');

import { generateAccessToken, respond, authenticate } from '../middleware/authMiddleware';

export default ({ config, db }) => {
	let api = Router();

	// '/v1/account'
	api.post('/register', (req, res) => {
		Account.register(new Account({ username: req.body.email }), req.body.password, function(err, account) {
			if (err) {
				res.send(err);
			}

			passport.authenticate(
				'local', {
					session: false
			})(req, res, () => {
				account.save(err => {
					if (err) { return res.status(500).send({ msg: err.message }); }
					res.send(err);
				});

				// SENDGRID EMAIL VALIDATION
				const sgMail = require('@sendgrid/mail');
				sgMail.setApiKey(process.env.SENDGRID_API_KEY);

				let token = new Token({_userId: account._id, token: crypto.randomBytes(16).toString('hex')});

				token.save(function (err) {
					if (err) { return res.status(500).send({ msg: err.message }); }
					const msg = {
						to: 'mark@hackeryou.com',
						from: 'mark@hackeryou.com',
						subject: 'Account verification token',
						html:
						'<div style=\"width: 100%;\">' +
						'<h1 style=\"text-align:center;\">Hi Friend!</h1>' +
						'<h4 style=\"text-align:center;\">Get ready to join the party with the Party Animals API</h4>' +
						'<p style=\"text-align:center\">Click the following link to finalize verification:</p>' +
						'<div style=\"text-align:center;\">' +
							`<a style=\"text-decoration:none; padding: 10px 10px; border-radius: 10px;\" href=\"http:\/\/${req.headers.host}\/v1\/account\/confirmation\/${token.token}\">To the party!</a>` +
						'</div>' +
						'</div>'
					};

					sgMail.send(msg);
				});

				// res.status(200).send('Successfully created new account');
			});
		});
	});

	// '/v1/account/login'
	api.post('/login', passport.authenticate(
		'local', {
			session: false,
			scope: []
		}), generateAccessToken, respond);


	// Token generation routes for email authentication
	// '/v1/account/confirmation'
	api.get('/confirmation/:id', (req, res, next) => {
		Token.findOne({ token: req.params.id }, function (err, token) {
			if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token may have expired.' });
			// If we found a token, find a matching user
			Account.findOne({ _id: token._userId, email: req.body.email }, function (err, user) {
				if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token' });
				if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

				// Verify and save the user with the updated verification status
				user.isVerified = true;
				// At this point the email validation has been clicked so can confirm email extension
				if (user.username.includes('@hackeryou.com')) user.isAdmin = true;

				user.save(function(err) {
					if (err) { return res.status(500).send({ msg: err.message }); }
					// res.status(200).send("The account has been verified. Please log in.");
					res.status(200).sendFile(path.join(__dirname+'../..'+'/successRegister.html'));
				});
			});
		});
	});

	// '/v1/account/logout'
	api.get('/logout', authenticate, (req, res) => {
		res.logout();
		res.status(200).send('Successfully logged out');
	});

	// '/v1/me'
	api.get('/me', authenticate, (req, res) => {
		res.status(200).json(req.user);
	});

	return api;
}
