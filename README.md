# 🎯 MECI Auth Challenge - Challenge "Sésame, ouvre-toi !"

## 🌟 Présentation du Défi

**MECI Auth Challenge** est une interface d'authentification innovante développée dans le cadre du défi "Sésame, ouvre-toi !" de la Nuit de l'Informatique. Cette application démontre une nouvelle approche d'authentification biométrique multimodale combinant une **séquence musicale de couleurs** et un **pattern spatial**.

### 🏢 Contexte Professionnel
Application développée pour **Eiffage Énergie Systèmes - Division MECI**, expert en comptage transactionnel pour les secteurs du gaz naturel et des liquides.

## 🎨 Caractéristiques du Défi

### 🔐 Authentification Multimodale Innovante
- **Double facteur d'authentification** original et créatif
- **Séquence de couleurs musicale** : Chaque couleur émet une note différente
- **Pattern spatial** : Dessin d'un motif sur une grille 3x3
- **Mémorisation intuitive** grâce aux associations sensorielles

### 🚀 Fonctionnalités Principales

#### 1. **Inscription Sécurisée**
- Création de compte avec email et username
- Enregistrement d'une séquence personnalisée de 3 à 5 couleurs
- Définition d'un pattern spatial unique
- Stockage sécurisé localement

#### 2. **Connexion Intelligente**
- Reconnaissance de la séquence de couleurs
- Validation du pattern spatial
- Feedback sonore en temps réel
- Protection contre les tentatives incorrectes

#### 3. **Dashboard Professionnel**
- Interface élégante avec gradients animés
- Profil utilisateur personnalisable
- Sections : Accueil, Profil, Paramètres
- Informations métier spécifiques à MECI

#### 4. **Gestion de Profil**
- Édition des informations personnelles
- Visualisation des paramètres de sécurité
- Date d'inscription et détails professionnels

## 🎵 Technologies Sonores

### Fréquences des Couleurs
Chaque couleur émet une note spécifique du solfège :
- **Bleu** (261.63 Hz) - Do
- **Vert** (329.63 Hz) - Mi
- **Jaune** (392.00 Hz) - Sol
- **Rouge** (523.25 Hz) - Do
- **Violet** (587.33 Hz) - Ré
- **Orange** (659.25 Hz) - Mi

### Génération Audio
Utilisation de l'**Audio Web API** pour générer des ondes sinusoïdales en temps réel, offrant une expérience immersive et mémorable.

## 🛠️ Stack Technique

### Frontend
- **React 18** - Bibliothèque UI moderne
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes élégantes
- **Web Audio API** - Génération sonore

### Déploiement
- **Vercel** - Hébergement et déploiement continu
- **GitHub** - Versioning et collaboration

## 📱 Interface Utilisateur

### Écran d'Accueil
- Design accueillant avec gradients animés
- Boutons d'inscription et connexion
- Présentation du concept

### Interface d'Authentification
- Grille de 6 couleurs interactives
- Matrice 3x3 pour le pattern spatial
- Visualisation en temps réel des séquences
- Feedback immédiat

### Dashboard
- Navigation intuitive (Accueil, Profil, Paramètres)
- Cartes informatives sur les activités MECI
- Éditeur de profil en ligne
- Visualisation des paramètres de sécurité

## 🔒 Sécurité et Stockage

### Protection des Données
- Stockage local sécurisé (LocalStorage)
- Validation côté client
- Protection contre les séquences incorrectes
- Pas de transmission réseau sensible

### Mémorisation
- Combinaison visuelle, auditive et spatiale
- Facilité de mémorisation naturelle
- Résistance à l'oubli grâce aux associations multisensorielles

## 🎯 Objectifs du Défi

### Pédagogiques
- Démontrer une approche innovante d'authentification
- Explorer les interactions multimodales
- Utiliser les APIs web modernes (Audio API)

### Professionnels
- Fournir une solution d'authentification intuitive
- Réduire la dépendance aux mots de passe
- Offrir une expérience utilisateur mémorable

### Techniques
- Maîtrise de React et des hooks
- Gestion d'état complexe
- Intégration audio en temps réel
- Design responsive et accessible

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+ et npm/yarn

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Mahfoud24087/meci-auth-challenge.git

# Accéder au dossier
cd meci-auth-challenge

# Installer les dépendances
npm install

# Lancer en développement
npm run dev