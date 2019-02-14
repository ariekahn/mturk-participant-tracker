const express = require('express');
const logger = require('morgan');

// Set up our app
const app = express();

// Log requests to the console
app.use(logger('dev'));

// Parse incoming json data
app.use(express.json());
// Parse URL parameters into the body
app.use(express.urlencoded({ extended: false }));

// Default route for everything
app.get('*', (req, res) => res.status(200).send({
    message: 'Participant database.',
}));

module.exports = app;
