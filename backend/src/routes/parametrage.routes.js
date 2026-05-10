const express = require('express');
const router = express.Router();
const parametrageController = require('../controllers/parametrageController');
const { auth, checkPermission, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Parametrage
 *   description: Settings and nomenclatures
 */

/**
 * @swagger
 * /api/parametrage:
 *   get:
 *     summary: Get all settings
 *     tags: [Parametrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of settings
 */
router.get('/', auth, checkPermission('read'), parametrageController.getParametrages);

/**
 * @swagger
 * /api/parametrage/nomenclatures:
 *   get:
 *     summary: Get nomenclatures
 *     tags: [Parametrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nomenclatures data
 */
router.get('/nomenclatures', auth, parametrageController.getNomenclatures);

/**
 * @swagger
 * /api/parametrage/{cle}:
 *   get:
 *     summary: Get setting by key
 *     tags: [Parametrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setting value
 */
router.get('/:cle', auth, parametrageController.getParametrageByKey);

/**
 * @swagger
 * /api/parametrage:
 *   post:
 *     summary: Set a parameter (admin only)
 *     tags: [Parametrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parameter set
 */
router.post('/', auth, authorize('admin'), parametrageController.setParametrage);

/**
 * @swagger
 * /api/parametrage/{cle}:
 *   delete:
 *     summary: Delete a parameter (admin only)
 *     tags: [Parametrage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Parameter deleted
 */
router.delete('/:cle', auth, authorize('admin'), parametrageController.deleteParametrage);

module.exports = router;