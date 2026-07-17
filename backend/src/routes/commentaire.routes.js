const express = require('express');
const router = express.Router();
const commentaireController = require('../controllers/commentaireController');
const { auth } = require('../middleware/auth');

router.get('/:entiteType/:entiteId', auth, commentaireController.getComments);
router.post('/', auth, commentaireController.createComment);
router.put('/:id', auth, commentaireController.updateComment);
router.delete('/:id', auth, commentaireController.deleteComment);

module.exports = router;
