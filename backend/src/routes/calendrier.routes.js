const express = require('express');
const router = express.Router();
const calendrierController = require('../controllers/calendrierController');
const { auth, checkPermission } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Calendrier
 *   description: Calendar and events
 */

/**
 * @swagger
 * /api/calendrier:
 *   get:
 *     summary: Get all events
 *     tags: [Calendrier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema: { type: string }
 *       - in: query
 *         name: end
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', auth, checkPermission('read'), calendrierController.getEvents);

/**
 * @swagger
 * /api/calendrier/audiences:
 *   get:
 *     summary: Get upcoming audiences
 *     tags: [Calendrier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of audiences
 */
router.get('/audiences', auth, checkPermission('read'), calendrierController.getAudiences);

/**
 * @swagger
 * /api/calendrier:
 *   post:
 *     summary: Create an event
 *     tags: [Calendrier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titre, type, dateDebut, dateFin]
 *             properties:
 *               titre: { type: string }
 *               type: { type: string, enum: [audience, rendez_vous, echeance, conge, formation, autre] }
 *               dateDebut: { type: string, format: date-time }
 *               dateFin: { type: string, format: date-time }
 *               lieu: { type: string }
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/', auth, checkPermission('write'), calendrierController.createEvent);

/**
 * @swagger
 * /api/calendrier/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Calendrier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event details
 */
router.get('/:id', auth, checkPermission('read'), calendrierController.getEventById);

/**
 * @swagger
 * /api/calendrier/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Calendrier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put('/:id', auth, checkPermission('write'), calendrierController.updateEvent);

/**
 * @swagger
 * /api/calendrier/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Calendrier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete('/:id', auth, checkPermission('delete'), calendrierController.deleteEvent);

module.exports = router;