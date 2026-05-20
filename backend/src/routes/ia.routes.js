const express = require('express');
const router = express.Router();
const iaController = require('../controllers/iaPredictiveController');
const { auth, checkPermission } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: IA Prédictive
 *   description: Système d'intelligence artificielle pour l'aide à la décision
 */

/**
 * @swagger
 * /api/ia/predict:
 *   post:
 *     summary: Prédictions pour un nouveau dossier
 *     tags: [IA Prédictive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, description]
 *             properties:
 *               titre: { type: string, description: 'Titre du dossier' }
 *               description: { type: string, description: 'Description textuelle du cas juridique' }
 *               typeAffaire: { type: string, enum: [civil, penal, commercial, travail, famille, administratif, immobilier, bancaire, autre] }
 *               priorite: { type: number, minimum: 1, maximum: 5, default: 3 }
 *     responses:
 *       200:
 *         description: Prédictions générées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     motsCles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           word: { type: string }
 *                           weight: { type: number }
 *                           category: { type: string }
 *                     categorie:
 *                       type: object
 *                       properties:
 *                         suggeree: { type: string }
 *                         confiance: { type: number }
 *                     similarDossiers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     duree:
 *                       type: object
 *                       properties:
 *                         jours: { type: number }
 *                         mois: { type: number }
 *                         confiance: { type: number }
 *                     probabiliteSuccess:
 *                       type: object
 *                       properties:
 *                         taux: { type: number }
 *                         confiance: { type: number }
 *                     avocatRecommande:
 *                       type: object
 *                       properties:
 *                         recommandation:
 *                           type: object
 *                         alternatives:
 *                           type: array }
 *                     documentsSuggeres:
 *                       type: array
 *                     planningSugere:
 *                       type: object
 */
router.post('/predict', auth, checkPermission('read'), iaController.predictDossier);

/**
 * @swagger
 * /api/ia/analyze:
 *   post:
 *     summary: Analyse textuelle et extraction de mots-clés
 *     tags: [IA Prédictive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string }
 *     responses:
 *       200:
 *         description: Analyse textuelle réussie
 */
router.post('/analyze', auth, iaController.analyzeText);

/**
 * @swagger
 * /api/ia/feedback:
 *   post:
 *     summary: Soumettre un feedback sur les prédictions
 *     tags: [IA Prédictive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [predictionId, dossierId]
 *             properties:
 *               predictionId: { type: string }
 *               dossierId: { type: string }
 *               suggestionsAcceptees: { type: object }
 *               suggestionsRefusees: { type: object }
 *               commentaire: { type: string }
 *     responses:
 *       200:
 *         description: Feedback enregistré avec succès
 */
router.post('/feedback', auth, iaController.submitFeedback);

/**
 * @swagger
 * /api/ia/planning-types:
 *   get:
 *     summary: Récupérer les types de planning disponibles
 *     tags: [IA Prédictive]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Types de planning récupérés
 */
router.get('/planning-types', auth, iaController.getPlanningTypes);

module.exports = router;