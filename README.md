
# MeetSpace — Backend

MeetSpace est une application web full-stack de réservation de salles, développée dans le cadre de la préparation au titre **RNCP 41133 — Concepteur Développeur d'Applications (niveau 6)**.

Ce dépôt contient l'API REST développée avec NestJS, permettant de gérer les utilisateurs, les salles et les réservations.

## Application en ligne

- **API REST :** https://meetspace-backend-5ybo.onrender.com/api
- **Documentation Swagger en local :** http://localhost:3001/api

Le backend est hébergé sur Render et utilise une base PostgreSQL hébergée sur Neon.

## Technologies utilisées

- **NestJS 11 / TypeScript 5** — Développement de l'API REST
- **PostgreSQL / Prisma 6** — Base de données et ORM
- **JWT / Passport / bcrypt** — Authentification et sécurité
- **Cloudinary / Multer** — Gestion des images
- **Swagger** — Documentation de l'API
- **Jest 30** — Tests automatisés
- **Render / Neon** — Hébergement

## Fonctionnalités principales

### Authentification
- Inscription, connexion et gestion du profil
- Authentification JWT et gestion des rôles `USER` et `ADMIN`
- Protection des routes avec les Guards NestJS

### Gestion des salles
- Consultation des salles
- Création, modification et suppression par un administrateur
- Gestion des images avec Cloudinary

### Gestion des réservations
- Création, consultation, modification et suppression
- Vérification des disponibilités et détection des conflits
- Contrôle des droits d'accès aux réservations
- Consultation des réservations par l'administrateur 

## Installation en local

### Prérequis

- Node.js et npm
- PostgreSQL
- Un compte Cloudinary

### 1. Cloner le dépôt

```bash
git clone https://github.com/lauraphanhoang/meetspace-backend.git
cd meetspace-backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="votre_cle_secrete"
FRONTEND_URL="http://localhost:3000"
PORT=3001

CLOUDINARY_CLOUD_NAME="votre_cloud_name"
CLOUDINARY_API_KEY="votre_api_key"
CLOUDINARY_API_SECRET="votre_api_secret"
```

Ne jamais publier les véritables identifiants et secrets sur GitHub.

### 4. Préparer la base de données

```bash
npx prisma generate
npx prisma migrate dev
```

### 5. Démarrer le serveur

```bash
npm run start:dev
```

L'API est accessible sur http://localhost:3001.

## Documentation API

La documentation Swagger est disponible en local :

http://localhost:3001/api

Elle permet de consulter et de tester les endpoints liés à l'authentification, aux utilisateurs, aux salles et aux réservations.

## Tests et commandes

```bash
npm run start:dev   # Démarrage en développement
npm run build       # Compilation
npm run start:prod  # Démarrage de la version compilée
npm run test        # Tests Jest
npm run test:cov    # Rapport de couverture
npm run lint        # Analyse et correction ESLint
```

**Résultats Jest du 17 octobre 2026 :**
- 12 suites de tests validées
- 127 tests réussis
- Aucun échec

## Déploiement

- **Backend :** Render
- **Base de données :** Neon (PostgreSQL)
- **Images :** Cloudinary

Les variables d'environnement sont configurées sur Render.

Les migrations Prisma sont appliquées en production avec :

```bash
npx prisma migrate deploy
```
