const express = require('express');
const router = express.Router();
const historiqueController = require('../controllers/historiqueController');
const { auth } = require('../middleware/auth');

router.get('/', auth, historiqueController.getHistorique);

module.exports = router;
