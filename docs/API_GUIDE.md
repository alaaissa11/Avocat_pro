# Guide d'Utilisation API AVOCAT-PRO

## Table des Matières
1. [Configuration Préalable](#configuration-préalable)
2. [Authentification](#authentification)
3. [Module Clients](#module-clients)
4. [Module Dossiers](#module-dossiers)
5. [Module Documents](#module-documents)
6. [Module Tâches](#module-tâches)
7. [Module Calendrier](#module-calendrier)
8. [Module Utilisateurs & Collaborateurs](#module-utilisateurs--collaborateurs)
9. [Module Facturation](#module-facturation)
10. [Module Traçabilité](#module-traçabilité)
11. [Module Paramétrage](#module-paramétrage)
12. [Statistiques & Tableau de Bord](#statistiques--tableau-de-bord)

---

## Configuration Préalable

### Démarrage des Services

```powershell
# 1. Démarrer MongoDB
Start-Service MongoDB

# 2. Lancer le backend
cd C:\Users\ALA AISSA\Avocat\backend
npm start
```

### Accès à Swagger
- URL: **http://localhost:3000/api-docs/**
- Documentation interactive de toutes les APIs

### Configuration Postman (Optionnel)
```json
{
  "baseUrl": "http://localhost:3000/api",
  "authHeader": "Authorization",
  "tokenPrefix": "Bearer"
}
```

---

## Authentification

### 1. Enregistrer un Nouvel Utilisateur

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "avocat@avocat-pro.tn",
  "password": "motdepasse123",
  "nom": "Boussayene",
  "prenom": "Mehdi",
  "role": "admin",
  "telephone": "+216 98 123 456"
}
```

**Réponse:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "avocat@avocat-pro.tn",
    "nom": "Boussayene",
    "prenom": "Mehdi",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Connexion

**Endpoint:** `POST /api/auth/login`

```json
{
  "email": "avocat@avocat-pro.tn",
  "password": "motdepasse123"
}
```

**Réponse:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "avocat@avocat-pro.tn",
    "nom": "Boussayene",
    "prenom": "Mehdi",
    "role": "admin",
    "permissions": ["read", "write", "delete", "manage_users"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Utiliser le Token

Dans Swagger ou Postman, ajouter le header:
```
Authorization: Bearer <votre_token>
```

---

## Module Clients

### Scénario Complet: Gestion des Clients

#### Étape 1: Créer un Client Particulier

**Endpoint:** `POST /api/clients`

```json
{
  "nom": "Ben Ali",
  "prenom": "Ahmed",
  "email": "ahmed.benali@email.com",
  "telephone": "+216 98 654 321",
  "adresse": "12, Avenue Habib Bourguiba",
  "ville": "Tunis",
  "codePostal": "1001",
  "cin": "12345678",
  "type": "particulier",
  "profession": "Ingénieur"
}
```

#### Étape 2: Créer une Entreprise Cliente

**Endpoint:** `POST /api/clients`

```json
{
  "nom": "TechCorp Tunisia",
  "raisonSociale": "TechCorp Tunisia SARL",
  "email": "contact@techcorp.tn",
  "telephone": "+216 71 123 456",
  "adresse": "5, Rue de la Technologie",
  "ville": "Sfax",
  "matriculeFiscal": "1234567A",
  "type": "entreprise"
}
```

#### Étape 3: Lister les Clients

**Endpoint:** `GET /api/clients?page=1&limit=10&search=ben&type=particulier`

#### Étape 4: Obtenir un Client Spécifique

**Endpoint:** `GET /api/clients/{client_id}`

#### Étape 5: Modifier un Client

**Endpoint:** `PUT /api/clients/{client_id}`

```json
{
  "telephone": "+216 99 654 321",
  "adresse": "25, Nouvelle Rue, Tunis"
}
```

#### Étape 6: Supprimer un Client

**Endpoint:** `DELETE /api/clients/{client_id}`

---

## Module Dossiers

### Scénario Complet: Gestion d'un Dossier Juridique

#### Étape 1: Créer un Dossier (avec IA Prédictive)

**Endpoint:** `POST /api/dossiers`

```json
{
  "titre": " divorce entre Mr et Mme Ben Salah",
  "description": "Le client demande un divorce pour faute suite à l'abandon du domicile conjugal par son épouse depuis plus de 2 ans. Il y a deux enfants mineurs en cause.",
  "clientId": "client_id_obtenu_precedemment",
  "typeAffaire": "famille",
  "priorite": 4,
  "assigneA": "user_id_avocat",
  "dateAudience": "2024-06-15T09:00:00Z",
  "chargeEstimee": 8
}
```

**Note:** L'IA analysera automatiquement la description et suggérera une catégorie avec un niveau de confiance.

**Réponse avec Prédiction IA:**
```json
{
  "numero": "DOS-2024-00001",
  "titre": " divorce entre Mr et Mme Ben Salah",
  "typeAffaire": "famille",
  "statut": "nouveau",
  "iaPrediction": {
    "categorieSuggeree": "famille",
    "confiance": 85,
    "datePrediction": "2024-01-15T10:30:00Z"
  },
  "historique": [
    {
      "action": "dossier_cree",
      "date": "2024-01-15T10:30:00Z",
      "details": "Dossier créé"
    }
  ]
}
```

#### Étape 2: Lister les Dossiers

**Endpoint:** `GET /api/dossiers?page=1&limit=10&statut=en_cours&typeAffaire=civil`

#### Étape 3: Modifier le Statut du Dossier

**Endpoint:** `PUT /api/dossiers/{dossier_id}`

```json
{
  "statut": "en_cours",
  "collaboreurs": ["user_id_1", "user_id_2"],
  "adversary": {
    "nom": "Mme Ben Salah",
    "avocat": "Me. Khemiri",
    "email": "avocat.khemiri@email.com"
  }
}
```

#### Étape 4: Ajouter un Commentaire/Note

**Endpoint:** `POST /api/dossiers/{dossier_id}/commentaire`

```json
{
  "commentaire": "Le client a fourni tous les documents demandés. Prochaine réunion fixée pour le 20 janvier."
}
```

#### Étape 5: Clôturer un Dossier

**Endpoint:** `PUT /api/dossiers/{dossier_id}`

```json
{
  "statut": "cloture",
  "dateCloture": "2024-01-20T15:00:00Z",
  "numeroDecision": "DEC-2024-001",
  "chargeConsommee": 12
}
```

#### Étape 6: Consulter l'Historique du Dossier

**Endpoint:** `GET /api/dossiers/{dossier_id}`

```json
{
  "historique": [
    {
      "action": "dossier_cree",
      "userId": "avocat_id",
      "date": "2024-01-15T10:30:00Z",
      "details": "Dossier créé"
    },
    {
      "action": "dossier_modifie",
      "userId": "avocat_id",
      "date": "2024-01-16T14:00:00Z",
      "details": "Dossier modifié - statut mis à jour"
    }
  ]
}
```

---

## Module Documents

### Scénario Complet: Gestion Documentaire

#### Étape 1: Uploader un Document

**Endpoint:** `POST /api/documents/upload`

**Form-Data:**
```
file: [Fichier PDF]
description: "Contrat de mariage"
dossierId: "dossier_id"
type: "contrat"
estPrive: false
```

#### Étape 2: Lister les Documents

**Endpoint:** `GET /api/documents?page=1&limit=10&type=contrat&dossierId={dossier_id}`

#### Étape 3: Télécharger un Document

**Endpoint:** `GET /api/documents/{document_id}/download`

#### Étape 4: Supprimer un Document

**Endpoint:** `DELETE /api/documents/{document_id}`

---

## Module Tâches

### Scénario Complet: Suivi des Tâches

#### Étape 1: Créer une Tâche

**Endpoint:** `POST /api/taches`

```json
{
  "titre": "Préparer les conclusions",
  "description": "Rédiger les conclusions en réponse",
  "dossierId": "dossier_id",
  "assigneeA": "user_id_collaborateur",
  "priorite": 4,
  "dateEcheance": "2024-01-25T17:00:00Z",
  "chargeEstimee": 4
}
```

#### Étape 2: Lister Mes Tâches

**Endpoint:** `GET /api/taches/my?statut=a_faire`

#### Étape 3: Lister Toutes les Tâches (Admin)

**Endpoint:** `GET /api/taches?statut=en_cours&assigneeA={user_id}`

#### Étape 4: Marquer une Tâche Terminée

**Endpoint:** `POST /api/taches/{tache_id}/terminer`

```json
{
  "chargeConsommee": 5
}
```

#### Étape 5: Réaffecter une Tâche

**Endpoint:** `PUT /api/taches/{tache_id}`

```json
{
  "assigneeA": "nouveau_user_id",
  "statut": "en_cours"
}
```

---

## Module Calendrier

### Scénario Complet: Planning des Audiences

#### Étape 1: Créer une Audience

**Endpoint:** `POST /api/calendrier`

```json
{
  "titre": "Audience de divorce - Affaire Ben Ali",
  "type": "audience",
  "dossierId": "dossier_id",
  "dateDebut": "2024-02-01T09:00:00Z",
  "dateFin": "2024-02-01T10:30:00Z",
  "lieu": "Tribunal de Tunis, Salle 3",
  "assignes": ["avocat_id", "assistant_id"],
  "priorite": 5,
  "rappel": {
    "actif": true,
    "delaiMinutes": 60
  }
}
```

#### Étape 2: Créer un Rendez-vous Client

**Endpoint:** `POST /api/calendrier`

```json
{
  "titre": "Rendez-vous Mr Ben Ali",
  "type": "rendez_vous",
  "clientId": "client_id",
  "dateDebut": "2024-01-20T14:00:00Z",
  "dateFin": "2024-01-20T15:00:00Z",
  "lieu": "Cabinet",
  "lienVisio": "https://meet.google.com/abc-defg-hij"
}
```

#### Étape 3: Lister les Événements par Période

**Endpoint:** `GET /api/calendrier?start=2024-01-01&end=2024-01-31`

#### Étape 4: Lister les Prochaines Audiences

**Endpoint:** `GET /api/calendrier/audiences`

#### Étape 5: Modifier un Événement

**Endpoint:** `PUT /api/calendrier/{event_id}`

```json
{
  "statut": "confirme",
  "lieu": "Nouvelle salle - Salle 5"
}
```

---

## Module Utilisateurs & Collaborateurs

### Scénario Complet: Gestion de l'Équipe

#### Étape 1: Lister les Utilisateurs

**Endpoint:** `GET /api/users`

#### Étape 2: Créer un Nouveau Collaborateur

**Endpoint:** `POST /api/auth/register`

```json
{
  "email": "assistant@avocat-pro.tn",
  "password": "assistant123",
  "nom": "Touati",
  "prenom": "Fatma",
  "role": "assistant",
  "telephone": "+216 55 123 456"
}
```

#### Étape 3: Modifier les Permissions

**Endpoint:** `PUT /api/users/{user_id}` (Admin uniquement)

```json
{
  "role": "avocat",
  "permissions": ["read", "write", "delete", "manage_dossiers", "view_stats"]
}
```

#### Étape 4: Consulter la Performance d'un Collaborateur

**Endpoint:** `GET /api/users/collaborateurs/{user_id}/performance`

```json
{
  "performance": {
    "totalHeuresTravailles": 160,
    "totalDossiersTraites": 12,
    "dossiersClotures": 8,
    "noteMoyenne": 4.2,
    "historiqueNotes": [
      {
        "date": "2024-01-15",
        "note": 4,
        "commentaire": "Excellent travail"
      }
    ]
  }
}
```

#### Étape 5: Noter un Collaborateur

**Endpoint:** `PUT /api/users/collaborateurs/{user_id}/performance`

```json
{
  "heures": 8,
  "dossiersTraites": 2,
  "note": 5,
  "commentaire": "Travail remarquable sur le dossier DOS-2024-00001"
}
```

---

## Module Facturation

### Scénario Complet: Gestion des Factures

#### Étape 1: Créer une Facture

**Endpoint:** `POST /api/factures`

```json
{
  "clientId": "client_id",
  "dossierId": "dossier_id",
  "dateEcheance": "2024-02-28T23:59:59Z",
  "articles": [
    {
      "description": "Honoraires de consultation",
      "quantite": 5,
      "prixUnitaire": 150,
      "tauxTVA": 19
    },
    {
      "description": "Frais de déplacement",
      "quantite": 2,
      "prixUnitaire": 50,
      "tauxTVA": 0
    }
  ],
  "conditionReglement": "Net à 30 jours"
}
```

**Réponse:**
```json
{
  "numero": "FAC-2024-00001",
  "totalHT": 850,
  "totalTVA": 142.50,
  "totalTTC": 992.50,
  "statut": "brouillon"
}
```

#### Étape 2: Valider et Envoyer la Facture

**Endpoint:** `PUT /api/factures/{facture_id}`

```json
{
  "statut": "envoyee"
}
```

#### Étape 3: Enregistrer un Paiement Partiel

**Endpoint:** `POST /api/factures/{facture_id}/payer`

```json
{
  "montantPaye": 500,
  "modeReglement": "virement"
}
```

**Réponse:**
```json
{
  "montantPaye": 500,
  "resteAPayer": 492.50,
  "statut": "envoyee"
}
```

#### Étape 4: Enregistrer le Paiement Total

**Endpoint:** `POST /api/factures/{facture_id}/payer`

```json
{
  "montantPaye": 492.50,
  "modeReglement": "virement"
}
```

**Réponse:**
```json
{
  "montantPaye": 992.50,
  "resteAPayer": 0,
  "statut": "payee",
  "dateReglement": "2024-02-15T10:00:00Z"
}
```

#### Étape 5: Consulter les Statistiques de Facturation

**Endpoint:** `GET /api/factures/stats`

```json
{
  "totalFactures": 25,
  "totalHT": 45000,
  "totalTTC": 53550,
  "totalPaye": 42000,
  "byMonth": [
    { "_id": "2024-01", "totalHT": 15000 },
    { "_id": "2024-02", "totalHT": 30000 }
  ]
}
```

---

## Module Traçabilité

### Scénario: Audit et Traçabilité des Opérations

#### Étape 1: Consulter le Journal d'Audit (Admin)

**Endpoint:** `GET /api/operations/audit`

```json
[
  {
    "type": "dossier_cree",
    "entiteType": "dossier",
    "entiteId": "dossier_id",
    "userId": { "nom": "Boussayene", "prenom": "Mehdi" },
    "date": "2024-01-15T10:30:00Z",
    "details": "Dossier DOS-2024-00001 créé"
  },
  {
    "type": "facture_payee",
    "entiteType": "facture",
    "entiteId": "facture_id",
    "userId": { "nom": "Ben Ali", "prenom": "Ahmed" },
    "date": "2024-01-15T14:00:00Z",
    "details": "Facture FAC-2024-00001 - Payment: 500 DT"
  }
]
```

#### Étape 2: Consulter par Période

**Endpoint:** `GET /api/operations?dateDebut=2024-01-01&dateFin=2024-01-31&type=dossier_cree`

#### Étape 3: Consulter l'Historique d'une Entité

**Endpoint:** `GET /api/operations/entity/dossier/{dossier_id}`

#### Étape 4: Consulter la Traçabilité Complète

**Endpoint:** `GET /api/operations/traceabilite?startDate=2024-01-01&endDate=2024-01-31`

---

## Module Paramétrage

### Scénario: Configuration du Système

#### Étape 1: Consulter les Nomenclatures

**Endpoint:** `GET /api/parametrage/nomenclatures`

```json
{
  "typesAffaire": [
    { "code": "civil", "libelle": "Affaire Civile" },
    { "code": "famille", "libelle": "Affaire de Famille" },
    { "code": "penal", "libelle": "Affaire Pénale" }
  ],
  "statutsDossier": [
    { "code": "nouveau", "libelle": "Nouveau" },
    { "code": "en_cours", "libelle": "En Cours" },
    { "code": "cloture", "libelle": "Clôturé" }
  ],
  "priorites": [
    { "code": 1, "libelle": "Très Faible" },
    { "code": 5, "libelle": "Très Haute" }
  ],
  "roles": [
    { "code": "admin", "libelle": "Administrateur" },
    { "code": "avocat", "libelle": "Avocat" }
  ]
}
```

#### Étape 2: Modifier un Paramètre

**Endpoint:** `POST /api/parametrage`

```json
{
  "cle": "TVA_DEFAULT",
  "valeur": 19,
  "description": "Taux de TVA par défaut",
  "type": "number",
  "categorie": "facturation"
}
```

#### Étape 3: Consulter un Paramètre

**Endpoint:** `GET /api/parametrage/TVA_DEFAULT`

#### Étape 4: Lister Tous les Paramètres

**Endpoint:** `GET /api/parametrage?categorie=general`

---

## Statistiques & Tableau de Bord

### Scénario: Obtenir les Statistiques Globales

#### Endpoint Principal

**Endpoint:** `GET /api/dossiers/stats`

```json
{
  "total": 45,
  "nouveau": 10,
  "enCours": 25,
  "cloture": 10,
  "byType": [
    { "_id": "civil", "count": 15 },
    { "_id": "famille", "count": 12 },
    { "_id": "penal", "count": 8 },
    { "_id": "commercial", "count": 10 }
  ],
  "byMonth": [
    { "_id": "2024-01", "count": 12 },
    { "_id": "2024-02", "count": 15 }
  ]
}
```

---

## Codes d'Erreur Courants

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Erreur de validation |
| 401 | Non autorisé (token manquant/invalide) |
| 403 | Accès refusé (permissions insuffisantes) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## Permissions par Rôle

| Permission | Admin | Avocat | Assistant | Secrétaire |
|------------|-------|--------|-----------|------------|
| read | ✅ | ✅ | ✅ | ✅ |
| write | ✅ | ✅ | ✅ | ✅ |
| delete | ✅ | ✅ | ❌ | ❌ |
| manage_users | ✅ | ❌ | ❌ | ❌ |
| manage_dossiers | ✅ | ✅ | ❌ | ❌ |
| manage_clients | ✅ | ✅ | ✅ | ✅ |
| view_stats | ✅ | ✅ | ❌ | ❌ |

---

## Bonnes Pratiques

1. **Toujours inclure le token** dans le header Authorization
2. **Valider les dates** au format ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
3. **Gérer les erreurs** avec try-catch côté frontend
4. **Pagination** recommandée pour les listes (> 100 éléments)
5. **保留令牌安全** - Ne jamais exposeer le token côté client