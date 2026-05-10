const express = require('express');
const router = express.Router();
const operationController = require('../controllers/operationController');
const { auth, checkPermission, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Operations
 *   description: Operations traceability
 */

/**
 * @swagger
 * /api/operations:
 *   get:
 *     summary: Get all operations
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of operations
 */
router.get('/', auth, checkPermission('read'), operationController.getOperations);

/**
 * @swagger
 * /api/operations/traceabilite:
 *   get:
 *     summary: Get traceability log
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Traceability data
 */
router.get('/traceabilite', auth, checkPermission('read'), operationController.getTraceabilite);

/**
 * @swagger
 * /api/operations/audit:
 *   get:
 *     summary: Get audit log (admin only)
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit log
 */
router.get('/audit', auth, authorize('admin'), operationController.getAuditLog);

/**
 * @swagger
 * /api/operations/entity/{entiteType}/{entiteId}:
 *   get:
 *     summary: Get operations by entity
 *     tags: [Operations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Entity operations
 */
router.get('/entity/:entiteType/:entiteId', auth, checkPermission('read'), operationController.getOperationsByEntity);

module.exports = router;