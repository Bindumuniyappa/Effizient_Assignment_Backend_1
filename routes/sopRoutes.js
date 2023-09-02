const express = require('express');
const sopController = require('../controllers/sopController');

const router = express.Router();

router.post('/generate-sop', sopController.generateAndSendSOP);

module.exports = router;
