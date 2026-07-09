const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.get('/conversations', auth, messageController.getConversations);
router.get('/with/:with', auth, messageController.getMessages);
router.post('/', auth, messageController.envoyerMessage);
router.put('/with/:with/lu', auth, messageController.markAsLu);

module.exports = router;
