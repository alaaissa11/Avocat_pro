const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { auth } = require('../middleware/auth');

router.post('/send', auth, invitationController.sendInvitation);
router.post('/:id/accept', auth, invitationController.acceptInvitation);
router.post('/:id/reject', auth, invitationController.rejectInvitation);
router.get('/received', auth, invitationController.getReceivedInvitations);
router.get('/sent', auth, invitationController.getSentInvitations);

module.exports = router;
