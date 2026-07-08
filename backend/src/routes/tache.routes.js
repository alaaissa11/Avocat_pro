const express = require('express');
const router = express.Router();
const tacheController = require('../controllers/tacheController');
const { auth, checkPermission } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Taches
 *   description: Task management
 */

/**
 * @swagger
 * /api/taches:
 *   get:
 *     summary: Get all tasks
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/', auth, checkPermission('read'), tacheController.getTaches);

/**
 * @swagger
 * /api/taches/my:
 *   get:
 *     summary: Get current user's tasks
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User tasks
 */
router.get('/my', auth, tacheController.getMyTaches);

/**
 * @swagger
 * /api/taches:
 *   post:
 *     summary: Create a task
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre]
 *             properties:
 *               titre: { type: string }
 *               description: { type: string }
 *               assigneeA: { type: string }
 *               priorite: { type: number }
 *               dateEcheance: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/', auth, checkPermission('write'), tacheController.createTache);

/**
 * @swagger
 * /api/taches/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task details
 */
router.get('/:id', auth, checkPermission('read'), tacheController.getTacheById);

/**
 * @swagger
 * /api/taches/{id}:
 *   put:
 *     summary: Update task
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put('/:id', auth, checkPermission('write'), tacheController.updateTache);

/**
 * @swagger
 * /api/taches/{id}:
 *   delete:
 *     summary: Delete task
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Task deleted
 */
router.delete('/:id', auth, checkPermission('delete'), tacheController.deleteTache);

/**
 * @swagger
 * /api/taches/{id}/terminer:
 *   post:
 *     summary: Complete task
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chargeConsommee: { type: number }
 *     responses:
 *       200:
 *         description: Task completed
 */
router.post('/:id/terminer', auth, tacheController.terminerTache);

/**
 * @swagger
 * /api/taches/{id}/status:
 *   put:
 *     summary: Update task status and feedback (for assignee)
 *     tags: [Taches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut: { type: string, enum: [a_faire, en_cours, terminee] }
 *               feedback: { type: string }
 *     responses:
 *       200:
 *         description: Task status updated
 */
router.put('/:id/status', auth, tacheController.updateTacheStatus);

module.exports = router;