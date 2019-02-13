var express = require('express');
var router = express.Router();

var subject_controller = require('../controllers/subjectController');


/* GET users listing. */
router.get('/', subject_controller.subject_list);

module.exports = router;
