# Infrastructure AVOCAT-PRO

## Architecture Globale (MEAN Stack)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Angular)                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Core Module (Singleton services, interceptors)           │  │
│  │  Shared Module (Components, pipes, directives)            │  │
│  │  Auth Module (Login, Register, Guard)                     │  │
│  │  Layout Module (Header, Sidebar, Footer)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐  │
│  │ Dossiers Module  │ │ Clients Module   │ │ Dashboard Module│  │
│  │                  │ │                  │ │                 │  │
│  │ - List           │ │ - List           │ │ - Statistics    │  │
│  │ - Create/Edit    │ │ - Create/Edit    │ │ - Quick Actions │  │
│  │ - Details        │ │ - Details        │ │ - Charts        │  │
│  │ - IA Predictive  │ │                  │ │                 │  │
│  └──────────────────┘ └──────────────────┘ └─────────────────┘  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐  │
│  │ Calendar Module  │ │ Documents Module │ │ Settings Module │  │
│  └──────────────────┘ └──────────────────┘ └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (Node.js/Express)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     MIDDLEWARES                           │  │
│  │  - Auth JWT      - Error Handler   - Rate Limiting       │  │
│  │  - Validation    - CORS            - File Upload          │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌──────────────────┐ ┌──────────────────┐ ┌─────────────────┐  │
│  │ Controllers      │ │ Services         │ │ Routes          │  │
│  │                  │ │                  │ │                 │  │
│  │ - auth.controller│ │ - auth.service   │ │ - auth.routes   │  │
│  │ - dossiers.ctrl  │ │ - dossiers.srv   │ │ - dossiers.r    │  │
│  │ - clients.ctrl   │ │ - clients.srv    │ │ - clients.r     │  │
│  │ - ia.controller  │ │ - ia.service     │ │ - ia.routes     │  │
│  └──────────────────┘ └──────────────────┘ └─────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      MODELS (MongoDB)                     │  │
│  │  - User, Role, Permission                                 │  │
│  │  - Client, Dossier, Affaire                               │  │
│  │  - Document, Tache, Historique                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                           Mongoose
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Collections:                                             │  │
│  │  - users          (utilisateurs + rôles)                 │  │
│  │  - clients        (informations clients)                 │  │
│  │  - dossiers       (dossiers catégorisés)                 │  │
│  │  - documents      (fichiers uploadés)                    │  │
│  │  - historiques    (traçabilité)                          │  │
│  │  - configurations (paramétrages)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Structure de Dossiers

### Racine Projet
```
AVOCAT-PRO/
├── frontend/          # Application Angular
├── backend/           # API Node.js/Express
├── docs/              # Documentation
└── docker/            # Config Docker (optionnel)
```

### Frontend (Angular)
```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Singleton services, guards, interceptors
│   │   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── services/
│   │   ├── shared/            # Composants, pipes, directives partagés
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   ├── layout/            # Structure de l'application
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   └── footer/
│   │   ├── features/          # Modules fonctionnels
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── dossiers/
│   │   │   ├── calendar/
│   │   │   ├── documents/
│   │   │   └── settings/
│   │   └── app.config.ts      # Config Angular 17+
│   │   └── app.routes.ts      # Routes principales
│   ├── assets/
│   ├── environments/
│   └── styles/
├── angular.json
└── package.json
```

### Backend (Node.js)
```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Configuration MongoDB
│   │   ├── jwt.js             # Config JWT
│   │   └── env.js             # Variables d'environnement
│   ├── middleware/
│   │   ├── auth.js            # Vérification JWT
│   │   ├── validation.js      # Validation des requêtes
│   │   └── errorHandler.js    # Gestion erreurs
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── dossierController.js
│   │   ├── iaController.js    # Prédictif IA
│   │   └── documentController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── iaService.js       # Logique IA classification
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── dossierRoutes.js
│   │   ├── iaRoutes.js
│   │   └── ...
│   ├── models/
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Dossier.js
│   │   ├── Document.js
│   │   └── Historique.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── helpers.js
│   ├── app.js
│   └── server.js
├── .env
├── package.json
└── README.md
```

## Modèles MongoDB (Schémas)

### User (Utilisateur)
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashé),
  nom: String,
  prenom: String,
  role: String ('admin', 'avocat', 'assistant', 'secretaire'),
  permissions: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Client
```javascript
{
  _id: ObjectId,
  nom: String,
  prenom: String,
  email: String,
  telephone: String,
  adresse: String,
  cin: String,
  type: String ('particulier', 'entreprise'),
  createdAt: Date,
  updatedAt: Date
}
```

### Dossier
```javascript
{
  _id: ObjectId,
  numero: String,           // Généré automatiquement
  titre: String,
  description: String,
  clientId: ObjectId,       // Référence Client
  typeAffaire: String,      // Catégorie (Civil, Pénal, Travail...)
  sousType: String,
  statut: String ('nouveau', 'en_cours', 'cloture', 'archive'),
  priorite: Number (1-5),
  assigneeTo: ObjectId,     // Avocat responsable
  dateCreation: Date,
  dateAudience: Date,
  dateCloture: Date,
  iaPrediction: {           // Prédiction IA
    categorieSuggeree: String,
    confiance: Number,
    datePrediction: Date
  },
  historique: [{
    action: String,
    userId: ObjectId,
    date: Date,
    details: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Document
```javascript
{
  _id: ObjectId,
  dossierId: ObjectId,
  nom: String,
  type: String,
  chemin: String,           // Chemin fichier
  taille: Number,
  uploadedBy: ObjectId,
  createdAt: Date
}
```

## Flux API Principal

### Création Dossier avec IA Prédictive
```
Frontend                                 Backend
   │                                        │
   │  POST /api/dossiers/with-ia            │
   │  { description, clientId, titre }      │
   ├───────────────────────────────────────>│
   │                                        │
   │                              ┌─────────┴─────────┐
   │                              │  1. Sauvegarde    │
   │                              │     dossier       │
   │                              └─────────┬─────────┘
   │                                        │
   │                              ┌─────────┴─────────┐
   │                              │  2. Appeler IA    │
   │                              │     classification│
   │                              └─────────┬─────────┘
   │                                        │
   │                              ┌─────────┴─────────┐
   │                              │  3. Mettre à jour │
   │                              │     prédiction    │
   │                              └─────────┬─────────┘
   │                                        │
   │                    { dossier, iaSuggestion } │
   │  <───────────────────────────────────────┤
   │                                        │
```

## Dépendances Clés

### Frontend
- Angular 17+
- Angular Material / PrimeNG
- RxJS
- Chart.js (stats)

### Backend
- Express.js
- Mongoose
- jsonwebtoken (JWT)
- bcryptjs
- multer (upload fichiers)
- openai (classification IA)

## Plan de Déploiement

```
┌────────────────────────────────────────────────────────┐
│  Production (Option 1 - Cloud)                        │
│  ├── Frontend: Vercel / Netlify / AWS S3             │
│  ├── Backend: Railway / Render / AWS EC2             │
│  └── Database: MongoDB Atlas                          │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Production (Option 2 - VPS)                          │
│  ├── Docker Compose                                   │
│  ├── Nginx (reverse proxy)                           │
│  ├── PM2 (process manager)                           │
│  └── MongoDB local                                    │
└────────────────────────────────────────────────────────┘
```

## Prochaines Étapes

1. **Setup Initial** : Créer les dossiers + installer dépendances
2. **Backend** : Configurer Express + MongoDB
3. **Frontend** : Configurer Angular + Router
4. **Auth** : Login + JWT
5. **CRUD Clients** : Opérations de base
6. **CRUD Dossiers** : Gestion des dossiers
7. **Module IA** : Classification prédictive
8. **Tests + Documentation**