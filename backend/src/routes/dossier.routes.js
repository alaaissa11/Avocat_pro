const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const multer = require('multer');
const path = require('path');
const { auth, checkPermission } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dossiers
 *   description: Case/Dossier management
 */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/**
 * @swagger
 * /api/dossiers:
 *   get:
 *     summary: Get all dossiers
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: typeAffaire
 *         schema: { type: string }
 *       - in: query
 *         name: statut
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of dossiers
 */
router.get('/', auth, checkPermission('read'), dossierController.getDossiers);

/**
 * @swagger
 * /api/dossiers:
 *   post:
 *     summary: Create a new dossier
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, clientId, typeAffaire]
 *             properties:
 *               titre: { type: string }
 *               description: { type: string }
 *               clientId: { type: string }
 *               typeAffaire: { type: string, enum: [civil, penal, commercial, travail, famille, administratif, immobilier, bancaire, autre] }
 *               priorite: { type: number }
 *               assigneA: { type: string }
 *     responses:
 *       201:
 *         description: Dossier created
 */
router.post('/', auth, checkPermission('write'), dossierController.createDossier);

/**
 * @swagger
 * /api/dossiers/stats:
 *   get:
 *     summary: Get dossier statistics
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics
 */
router.get('/stats', auth, dossierController.getStats);

/**
 * @swagger
 * /api/dossiers/{id}:
 *   get:
 *     summary: Get dossier by ID
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dossier details
 */
router.get('/:id', auth, checkPermission('read'), dossierController.getDossierById);

/**
 * @swagger
 * /api/dossiers/{id}:
 *   put:
 *     summary: Update dossier
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dossier updated
 */
router.put('/:id', auth, checkPermission('write'), dossierController.updateDossier);

/**
 * @swagger
 * /api/dossiers/{id}:
 *   delete:
 *     summary: Delete dossier
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dossier deleted
 */
router.delete('/:id', auth, checkPermission('delete'), dossierController.deleteDossier);

/**
 * @swagger
 * /api/dossiers/{id}/commentaire:
 *   post:
 *     summary: Add comment to dossier
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [commentaire]
 *             properties:
 *               commentaire: { type: string }
 *     responses:
 *       200:
 *         description: Comment added
 */
router.post('/:id/commentaire', auth, dossierController.addCommentaire);

/**
 * @swagger
 * /api/dossiers/{id}/cloturer:
 *   post:
 *     summary: Close a dossier and archive it to history
 *     tags: [Dossiers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dossier closed
 */
router.post('/:id/cloturer', auth, dossierController.cloturerDossier);

module.exports = router;