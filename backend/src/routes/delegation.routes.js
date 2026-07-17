const express = require('express');
const router = express.Router();
const delegationController = require('../controllers/delegationController');
const { auth } = require('../middleware/auth');

router.post('/', auth, delegationController.createDelegation);
router.get('/recues', auth, delegationController.getReceived);
router.get('/envoyees', auth, delegationController.getSent);
router.get('/entite/:entiteType/:entiteId', auth, delegationController.getEntityDelegation);
router.put('/:id/accept', auth, delegationController.acceptDelegation);
router.put('/:id/refuser', auth, delegationController.refuseDelegation);
router.put('/:id/terminer', auth, delegationController.terminerDelegation);

module.exports = router;
