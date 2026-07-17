const express = require('express');
const router = express.Router();
const iaController = require('../controllers/iaController');
const { auth } = require('../middleware/auth');

router.post('/suggest-type', auth, iaController.suggestType);

module.exports = router;
