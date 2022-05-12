var express = require('express');
var router = express.Router();
const graphController = require('../controller.js/schedule');
// SCHEDULE meeting 
router.post('/scheduleMeeting', graphController.scheduleMeeting);
module.exports = router;