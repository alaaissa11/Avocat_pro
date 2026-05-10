const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const { auth, checkPermission } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Factures
 *   description: Invoice management
 */

/**
 * @swagger
 * /api/factures:
 *   get:
 *     summary: Get all invoices
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 */
router.get('/', auth, checkPermission('read'), factureController.getFactures);

/**
 * @swagger
 * /api/factures/stats:
 *   get:
 *     summary: Get invoice statistics
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 */
router.get('/stats', auth, checkPermission('read'), factureController.getStatsFacturation);

/**
 * @swagger
 * /api/factures:
 *   post:
 *     summary: Create an invoice
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId]
 *             properties:
 *               clientId: { type: string }
 *               articles: { type: array }
 *     responses:
 *       201:
 *         description: Invoice created
 */
router.post('/', auth, checkPermission('write'), factureController.createFacture);

/**
 * @swagger
 * /api/factures/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice details
 */
router.get('/:id', auth, checkPermission('read'), factureController.getFactureById);

/**
 * @swagger
 * /api/factures/{id}:
 *   put:
 *     summary: Update invoice
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice updated
 */
router.put('/:id', auth, checkPermission('write'), factureController.updateFacture);

/**
 * @swagger
 * /api/factures/{id}/payer:
 *   post:
 *     summary: Pay invoice
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [montantPaye]
 *             properties:
 *               montantPaye: { type: number }
 *               modeReglement: { type: string }
 *     responses:
 *       200:
 *         description: Payment processed
 */
router.post('/:id/payer', auth, checkPermission('write'), factureController.payerFacture);

/**
 * @swagger
 * /api/factures/{id}:
 *   delete:
 *     summary: Delete invoice
 *     tags: [Factures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoice deleted
 */
router.delete('/:id', auth, checkPermission('delete'), factureController.deleteFacture);

module.exports = router;