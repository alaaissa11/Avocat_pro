const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize, checkPermission } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', auth, authorize('admin', 'avocat'), userController.getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user (admin/avocat only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, nom, prenom]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               nom: { type: string }
 *               prenom: { type: string }
 *               role: { type: string, enum: [admin, avocat, collaborateur, assistant, secretaire] }
 *               telephone: { type: string }
 *               specialite: { type: array, items: { type: string } }
 *               tauxHoraire: { type: number }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Email already in use
 */
router.post('/', auth, authorize('admin', 'avocat'), userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 */
router.get('/:id', auth, checkPermission('read'), userController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/:id', auth, authorize('admin', 'avocat'), userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', auth, authorize('admin', 'avocat'), userController.deleteUser);

/**
 * @swagger
 * /api/users/collaborateurs/list:
 *   get:
 *     summary: Get all collaborateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of collaborateurs
 */
router.get('/collaborateurs/list', auth, checkPermission('read'), userController.getCollaborateurs);

/**
 * @swagger
 * /api/users/collaborateurs/{id}/performance:
 *   get:
 *     summary: Get collaborateur performance
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance data
 */
router.get('/collaborateurs/:id/performance', auth, checkPermission('read'), userController.getCollaborateurStats);

/**
 * @swagger
 * /api/users/collaborateurs/{id}/performance:
 *   put:
 *     summary: Update collaborateur performance
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance updated
 */
router.put('/collaborateurs/:id/performance', auth, authorize('admin', 'avocat'), userController.updateCollaborateurPerformance);

module.exports = router;