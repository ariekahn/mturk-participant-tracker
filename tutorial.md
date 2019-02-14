This document is a summary of the steps involved in designing and building this service.

# Prerequisites

The only real prerequisite is that you have `node` and `npm` installed. `node` is the underlying javascript environmnent, and `npm` is `node's` package manager, which comes bundled with it.

Open up a CLI, and type `npm -v` to see what if any version you have installed. As of February 2019, the most recent version is `6.7.0`

If you don't have `node` installed, my suggestion would be to install `nvm`, or `Node Version Manager` here: https://github.com/creationix/nvm

Install `nvm` by running:
```
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```
**WARNING:** the version given in the command here is probably out of date. I highly recommend visiting the `nvm` site [here](https://github.com/creationix/nvm#install-script) to which will list the proper command to run.

Finally, install `node by running:
```console
$ nvm install node
```


# Project Setup

Pick a directory and a project name.

In my case, I'm storing most one-off projects under `~/repos`.

```console
$ cd ~/repos
$ mkdir -p mturk-participant-tracker
$ cd mturk-participant tracker
```

Let's create a project template
```console
$ npm init -y
```

This will create `package.json` for us, which describes the package.

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

At this point you should have:
```bash
mturk-participant-tracker
├── app.js
├── bin
│   └── www
├── package.json
```

Now we can start our project by running
```console
$ npm run start:dev
```

This will launch a server at `http://localhost:8000`
```console
$ curl http://localhost:8000
```
```json
{"message":"Participant database."}
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

Now, we'll have `sequelize-cli` automatically create that structure:
```console
$ sequelize-cli init
```

Your directory should now look like:
```bash
mturk-participant-tracker
├── app.js
├── bin
│   └── www
├── config
│   └── database.json
├── db
│   ├── migrations
│   ├── models
│   │   └── index.js
│   └── seeders
├── package.json
```

What did this just do?

It created a folder `db`, which stores code and metadata *about* the database.

- `db/models`: This is probably the most important, and the only directory you'll directly work with. This is where we'll have code defining the tables in the database.
- `db/migrations`: These are files specifying how to change the database when we change the tables. Think of it as commands that let us go back and forth in time between databases with different layouts.
- `db/seeders`: This stores 'seed' database entries, useful for running tests.

Let's take a look at the files created.

## `config/database.json`
```json
{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

This lists separate databases to use for development, testing, and production, a common split so that you can test changes without affecting your "live" database.

We're going to change this to a simple setup using `sqlite`:
```json
{
  "development": {
    "dialect": "sqlite",
    "storage": "./database.sqlite3",
    "operatorsAliases": false
  },
  "test": {
    "dialect": "sqlite",
    "storage": ":memory",
    "operatorsAliases": false
  },
  "production": {
    "dialect": "sqlite",
    "storage": "./database.sqlite3",
    "operatorsAliases": false
  }
}
```

The `operatorsAliases` line was taken from [here](https://github.com/sequelize/sequelize/issues/8417) to get rid of a warning.

## `db/models/index.js`

```js
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../../config/database.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
```

This contains the configuration for using the database. By default, we use the `development` environment, unless `NODE_ENV` is defined. Next, we establish a connection with the database, load in all models, and define any relationships. Finally, we export our database as `db` for use elsewhere in the code.

## Initializing the database

Finally, we can create a database (empty at this point) by running
```console
$ sequelize db:migrate
```

# Models

We'll create a really simple worker model:

```console
$ sequelize model:create --name Worker --attributes workerid:string,hitid:string,status:integer
```

This creates a model for us at `db/models/worker.js`:
```js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define('Worker', {
    workerid: DataTypes.STRING,
    hitid: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {});
  Worker.associate = function(models) {
    // associations can be defined here
  };
  return Worker;
};
```

To add this to our database, we can run
```console
$ sequelize db:migrate
```

# Controllers

We'll store our controllers in `db/controllers`:
```console
$ mkdir -p db/controllers
```

## Creating Workers

Let's create `db/controllers/workers.js`:

```js
const Worker = require('../models').Worker;

module.exports = {
    create(req, res) {
        return Worker
        .create({
            workerid: req.body.workerid,
            hitid: req.body.hitid,
            status: req.body.status,
        })
        .then(worker => res.status(201).send(worker))
        .catch(error => res.status(400).send(error));
    },
};
```

Then we'll create `db/controllers/index.js` where we'll export all our controllers.
```js
const workers = require('./workers');

module.exports = {
  workers,
};
```

We also want to create a route. This is what will handle routing for all our API calls.
In `db/routes/index.js`:
```js
const workersController = require('../controllers').workers;

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Worker API.',
  }));

  app.post('/api/workers', workersController.create);
}
```

This will add two routes:
A GET route at `/api` and a POST route at `/api/workers`.

Finally, to include routing for this, we modify `app.js` to read:
```js
require('./app/routes')(app)
// Default route for everything
app.get('*', (req, res) => res.status(200).send({
    message: 'Participant database.',
}));
```

Let's try this route out:
```console
$ curl -X POST -d '{"workerid":"w1", "hitid":"hit1", "status":3}' -H "Content-Type: application/json" http://localhost:8000/api/workers
```

## Listing Workers

Let's modify `db/controllers/workers.js` to add a list method that will return all workers:
```js
list(req, res) {
  return Worker
  .findAll()
  .then(workers => res.status(200).send(workers))
  .catch(error => res.status(200).send(error));
}
```

Then we'll add a second route into `db/routes/index.js`:
```js
...
app.post('/api/workers', workersController.create);
app.get('/api/workers', workersController.list);
...
```

```console
$ curl -X GET http://localhost:8000/api/workers
```

We now have an API for both adding individual workers as well as fetching all of them.