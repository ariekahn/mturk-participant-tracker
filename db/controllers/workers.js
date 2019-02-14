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
    list(req, res) {
        return Worker
        .all()
        .then(workers => res.status(200).send(workers))
        .catch(error => res.status(200).send(error));
    },
};