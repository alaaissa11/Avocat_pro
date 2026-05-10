# Utilisation des APIs Backend AVOCAT-PRO

## Comment Utiliser les APIs Backend

Pour utiliser les APIs du backend AVOCAT-PRO depuis votre application Angular, voici les étapes essentielles :

### 1. Configuration de Base

Le backend expose ses endpoints à l'adresse `http://localhost:3000/api/`. Toutes les requêtes nécessitant une authentification doivent inclure le header `Authorization: Bearer <token>`.

### 2. Flux d'Authentification

Avant toute opération, l'utilisateur doit s'authentifier en appelant `POST /api/auth/login` avec ses identifiants. Le serveur retourne un token JWT à utiliser pour toutes les requêtes suivantes. Ce token expire après 7 jours et doit être rafraichi via une nouvelle connexion.

### 3. Appel des APIs depuis Angular

Dans votre service Angular, créez des méthodes qui appellent les endpoints via `HttpClient`. Le token JWT doit être inclus automatiquement via un interceptor Angular qui intercepte toutes les requêtes sortantes et ajoute le header Authorization.

### 4. Gestion des Réponses

Toutes les APIs retournent des réponses JSON standardisées. Les endpoints de liste (`GET`) paginent les résultats avec les propriétés `page`, `limit`, `total` et `pages`. Les erreurs sont retournées avec un code HTTP (400, 401, 403, 404, 500) et un message descriptif.

### 5. Documentation Interactive

Swagger est disponible à l'adresse `http://localhost:3000/api-docs/` pour explorer, tester et documenter toutes les APIs avec leurs paramètres, corps de requête et réponses attendues.

### 6. Structure des Appels Type

- **GET** : Récupérer des données (listes, détails)
- **POST** : Créer de nouvelles ressources
- **PUT** : Modifier des ressources existantes
- **DELETE** : Supprimer des ressources

Chaque appel authentifié vérifie les permissions de l'utilisateur selon son rôle (admin, avocat, assistant, secrétaire).