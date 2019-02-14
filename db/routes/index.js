const workersController = require('../controllers').workers;

module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Worker API.',
  }));

  app.post('/api/workers', workersController.create);
  app.get('/api/workers', workersController.list);
}
