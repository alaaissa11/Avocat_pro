# Guide de Test - APIs Clients et Dossiers

## Structure du Projet

### Backend (Node.js/Express/Mongoose)
- **Models**: `backend/src/models/`
  - `Client.js` - Modèle Client (20 champs)
  - `Dossier.js` - Modèle Dossier (30 champs)
- **Controllers**: `backend/src/controllers/`
  - `clientController.js` - CRUD Clients
  - `dossierController.js` - CRUD Dossiers
- **Routes**: `backend/src/routes/`
  - `/api/clients` - Endpoints Clients
  - `/api/dossiers` - Endpoints Dossiers

### Frontend (Angular 17)
- **Services**: `frontend/src/app/core/services/`
  - `client.service.ts` - Service Client
  - `dossier.service.ts` - Service Dossier
- **Models**: `frontend/src/app/core/models/`
  - `dossier.model.ts` - Interfaces TypeScript

## Comment démarrer les tests

### 1. Démarrer MongoDB
```bash
mongod
```

### 2. Démarrer le Backend
```bash
cd backend
npm start
# Le serveur tourne sur http://localhost:3000
```

### 3. Tester les APIs (dans un nouveau terminal)
```bash
cd backend
node test-api.js
```

### 4. Tester depuis le Frontend
Les services Angular pointent vers `http://localhost:3000/api/`

## Endpoints Clients

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/clients` | Créer un client |
| GET | `/api/clients` | Liste des clients (paginée) |
| GET | `/api/clients?page=1&limit=10&search=test` | Liste avec filtres |
| GET | `/api/clients/:id` | Client par ID |
| PUT | `/api/clients/:id` | Modifier un client |
| DELETE | `/api/clients/:id` | Supprimer un client |

### Corps de requête POST Client
```json
{
  "nom": "Nom",
  "prenom": "Prénom",
  "email": "email@example.com",
  "telephone": "+21612345678",
  "adresse": "Adresse",
  "ville": "Tunis",
  "type": "particulier | entreprise",
  "cin": "12345678",
  "matriculeFiscal": "MF123456"
}
```

## Endpoints Dossiers

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/dossiers` | Créer un dossier |
| GET | `/api/dossiers` | Liste des dossiers (paginée) |
| GET | `/api/dossiers?page=1&limit=10&typeAffaire=civil` | Liste avec filtres |
| GET | `/api/dossiers/:id` | Dossier par ID (avec populated client) |
| PUT | `/api/dossiers/:id` | Modifier un dossier |
| DELETE | `/api/dossiers/:id` | Supprimer un dossier |
| GET | `/api/dossiers/stats` | Statistiques |

### Corps de requête POST Dossier
```json
{
  "titre": "Titre du dossier",
  "description": "Description",
  "clientId": "507f1f77bcf86cd799439011",
  "typeAffaire": "civil | penal | commercial | travail | famille | administratif | immobilier | bancaire | autre",
  "priorite": 1-5,
  "statut": "nouveau | en_cours | en_attente | cloture | archive"
}
```

## Exemple de consommation depuis le Frontend

### ClientService (Angular)
```typescript
import { ClientService } from './core/services/client.service';

// Liste des clients
this.clientService.getClients({ page: 1, limit: 10, search: 'test' })
  .subscribe(response => {
    this.clients = response.clients;
  });

// Créer un client
this.clientService.createClient({
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean.dupont@email.com',
  telephone: '+21612345678'
}).subscribe(client => {
  console.log('Client créé:', client);
});
```

### DossierService (Angular)
```typescript
import { DossierService } from './core/services/dossier.service';

// Liste des dossiers
this.dossierService.getDossiers({ 
  page: 1, 
  limit: 10, 
  typeAffaire: 'civil',
  statut: 'en_cours'
}).subscribe(response => {
  this.dossiers = response.dossiers;
});

// Créer un dossier
this.dossierService.createDossier({
  titre: 'Affaire Test',
  description: 'Description',
  clientId: '507f1f77bcf86cd799439011',
  typeAffaire: 'civil'
}).subscribe(dossier => {
  console.log('Dossier créé:', dossier);
});
```

## Relation Client <-> Dossier

```
Client (1) ----> (N) Dossier
          clientId
```

- Chaque Dossier contient un `clientId` référençant un Client
- Lors de la création d'un Dossier, le `clientId` est obligatoire
- Les endpoints GET /dossiers incluent le client populate

## Tests Automatisés

### Test des modèles (connexion BDD)
```bash
cd backend
node test-models.js
```

### Test des APIs (serveur must be running)
```bash
cd backend
node test-api.js
```

## Validation des données

Les deux modèles incluent:
- **Validation required**: Champs obligatoires
- **Validation enum**: Valeurs limitées (type, typeAffaire, statut)
- **Validation range**: priorite (1-5)
- **Dates**: createdAt, updatedAt automatic
- **Historique**: Suivi des modifications