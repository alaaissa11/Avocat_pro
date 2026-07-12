const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const dossierRoutes = require('./routes/dossier.routes');
const documentRoutes = require('./routes/document.routes');
const tacheRoutes = require('./routes/tache.routes');
const calendrierRoutes = require('./routes/calendrier.routes');
const userRoutes = require('./routes/user.routes');
const factureRoutes = require('./routes/facture.routes');
const operationRoutes = require('./routes/operation.routes');
const parametrageRoutes = require('./routes/parametrage.routes');
const iaRoutes = require('./routes/ia.routes');
const historiqueRoutes = require('./routes/historique.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const invitationRoutes = require('./routes/invitation.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AVOCAT-PRO API',
      version: '1.0.0',
      description: 'API de gestion du cabinet d\'avocats Boussayene Knani Law Firm',
      contact: { name: 'Support', email: 'support@avocat-pro.tn' }
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}`, description: 'Serveur de développement' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/taches', tacheRoutes);
app.use('/api/calendrier', calendrierRoutes);
app.use('/api/users', userRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/operations', operationRoutes);
app.use('/api/parametrage', parametrageRoutes);
app.use('/api/ia', iaRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => res.json({ status: 'OK', date: new Date() }));
app.use(errorHandler);

module.exports = app;