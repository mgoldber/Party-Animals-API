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

	// '/v1/account/register'
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
						to: account.username,
						from: 'mark@hackeryou.com',
						subject: 'Party Animals Account Verification Token',
						html:
						'<div style=\"width: 100%;background-image:linear-gradient(#3D6417, #143307); color: white; line-height:2; font-family: arial;\">' +
						'<h1 style=\"text-align:center;\">Hi Party Animal!</h1>' +
						'<h4 style=\"text-align:center;\">Get ready to join the party with the Party Animals API</h4>' +
						'<p style=\"text-align:center\">Click the following link to finish verification:</p>' +
						'<div style=\"text-align:center;\">' +
							`<a style=\"padding: 10px 10px; color: white;\" href=\"http:\/\/${req.headers.host}\/api\/v1\/account\/confirmation\/${token.token}\">TO THE PARTY!</a>` +
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

	// '/v1/account/forgot'
	api.post('/forgot', (req, res) => {
		Account.findOne({username: req.body.email}, function(err, user) {
			if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this email' });
			
			// SENDGRID EMAIL VALIDATION
			const sgMail = require('@sendgrid/mail');
			sgMail.setApiKey(process.env.SENDGRID_API_KEY);
			
			// Generates a new temporary token that gives user time to create a new password
			let token = new Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});

			// Store the new password on a newly generated field on the user object
			user.resetPasswordToken = token.token;

			user.save(function (err) {
				if (err) { return res.status(500).send({ msg: err.message }); }
				const msg = {
					to: user.username,
					from: 'mark@hackeryou.com',
					subject: 'Party Animals Password Reset',
					html:
					'<div style=\"width: 100%;background-image:linear-gradient(#3D6417, #143307); color: white; line-height:2; font-family: arial;\">' +
					'<h1 style=\"text-align:center;\">Hi Party Password Resetter!</h1>' +
					'<p style=\"text-align:center\">You are receiving this because you (or someone else) have requested the reset of the password for your account:</p>' +
					'<div style=\"text-align:center;\">' +
						`<a style=\"padding: 10px 10px; color: white;\" href=\"http:\/\/${req.headers.host}\/api\/v1\/account\/reset\/${token.token}\">Reset Password!</a>` +
					'</div>' +
					'</div>'
				};

				sgMail.send(msg);
			});
			res.status(200).send('Successfully sent email to reset password');
		})
	});

	// '/v1/account/reset/:token'
	api.get('/reset/:token', (req, res) => {
		Account.findOne({resetPasswordToken: req.params.token}, function(err, user) {
			if (!user) return res.status(400).send({ msg: 'Password reset token is invalid or has expired' });
			// Display the form that contains the form that allows the update
			res.status(200).sendFile(path.join(__dirname+'../..'+'/passwordReset.html'));
		})
	});

	// '/v1/account/reset/:token'
	api.post('/reset/:token', (req, res) => {

		// SENDGRID EMAIL VALIDATION
		const sgMail = require('@sendgrid/mail');
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);

		Account.findOne({resetPasswordToken: req.params.token}, function(err, user) {
			if (!user) return res.status(400).send({ msg: 'Password reset token is invalid or has expired' });
			if (err) return res.status(500).send({ msg: err.message }); 
			
			// Clear the temporary token that is generated at the start of the forgot password flow
			user.resetPasswordToken = undefined;

			// Set password is a built in instance method that forces a password change and correctly updates the hash
			user.setPassword(req.body.password, function(err) {
				if (err) return res.status(500).send({ msg: err.message });

				// Have to save the user object with the new password that has been set
				user.save(function (err) {
					if (err) { return res.status(500).send({ msg: err.message }); }
					
					req.login(user, function(err) {
						if (err) return res.status(400).send({ msg: err.message });
						// Only message the user that the password was properly reset if no error was thrown prior
						const msg = {
							to: user.username,
							from: 'mark@hackeryou.com',
							subject: 'Party Animals Password Reset',
							html:
							'<div style=\"width: 100%;background-image:linear-gradient(#3D6417, #143307); color: white; line-height:2; font-family: arial;\">' +
							'<h1 style=\"text-align:center;\">You did it!</h1>' +
							`<p style=\"text-align:center\">You successfully changed the password for the account associated with ${user.username}</p>` +
							'</div>'
						};
		
						sgMail.send(msg);
						res.status(200).send('Successfully completed the password reset process')
					});
				});
			});
		});
	});

	// '/v1/me'
	api.get('/me', authenticate, (req, res) => {
		res.status(200).json(req.user);
	});

	return api;
}
