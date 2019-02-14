This document is a summary of the steps involved in designing and building this service.

# Project Setup

```console
$ mkdir -p mturk-participant-tracker
$ cd mturk-participant tracker
```

Let's create a project template
```console
$ npm init -y
```

This will create our config in `package.json`

Next, we're going to install node packages necessay for the project. We're basing the app on `expressjs`,
we'll be using `sqlite3` for a lightweight database, and we'll use `sequelize` as an ORM.

```console
$ npm install expressjs sqlite3 sequelize
```

Additionally, `nodemon` lets us restart our server whenever we make modifications.

```console
$ npm install -D nodemon
```

# Express.js

To generate our basic server, we'll need two main parts:

1) `app.js` will contain our server logic
2) `bin/www` will launch the webserver, and pull in `app.js`

Let's start with `bin/www`:
```js
const http = require('http');
const app = require('../app');

const port = parseInt(process.env.PORT, 10) || 8000;
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
```

This creates a basic http server, loads our `app.js` code, and starts listening on port 8000.

Next, `app.js`:
```js
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
```
This creates our app instance, sets up logging, and loads two `express` modules:

1) `express.json` parses any json-encoded data, appending it to the request body
2) `express.urlencoded` does the same for url-encoded data. `extended` specifies which of two parsers to use.

Finally, we want to make an easy debugging route:
Open up `package.json`, and add a script titled `start:debug`:
```json
  "scripts": {
    "start:dev": "nodemon ./bin/www"
  },
```
and install the `nodemon` tool:
```console
$ npm install -G nodemon
```

# Database
We're going to use the `sequelize-cli` tool to simplify database operations.

To install the sequelize-cli tool, run
```console
$ npm install -G sequelize-cli
```

First, we want to make a template to tell `sequelize` our directory structure.
We put the following in `.sequelizerc` at the top level of the project:
```js
const path = require('path');

module.exports = {
    "config": path.resolve('config', 'database.json'),
    "models-path": path.resolve('db', 'models'),
    "seeders-path": path.resolve('db', 'seeders'),
    "migrations-path": path.resolve('db', 'migrations')
};
```

