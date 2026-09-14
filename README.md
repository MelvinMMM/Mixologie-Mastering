# 🍸 Mixology Master — Référentiel Officiel 2025/2026

![Version](https://img.shields.io/badge/Version-1.2.0-blue.svg)
![Référentiel](https://img.shields.io/badge/Référentiel-Édition%202025%2F2026-gold.svg)
![Licence](https://img.shields.io/badge/Licence-Pédagogique-green.svg)
![Netlify](https://img.shields.io/badge/Déploiement-Netlify-00C7B7.svg)

**Mixology Master** est une application web interactive d'apprentissage, d'entraînement et de révision exhaustive, conçue à 100 % sur la base du document pédagogique national officiel : **« Référentiel Officiel des Cocktails Classiques de Référence — Édition 2025/2026 »**.

L'application s'adresse aux élèves et apprentis en formation barman (Mention Complémentaire Employé Barman, Brevet Professionnel Barman, CAP/Bac Pro Restauration), aux professionnels du bar et de l'hôtellerie, ainsi qu'aux passionnés de mixologie préparant des examens ou des concours officiels.

---

## 🌟 Fonctionnalités Clés

### 1. 📚 Les 9 Modules de Formation Officiels (141 Questions)
- **Partie 1 — Guide des bonnes pratiques** : Règle d'or des créations (6 ingrédients maximum, 1 eau-de-vie principale), règle d'équilibre des 3 S (*Strong*, *Sweet*, *Sour*), ordre strict de versement, notation exclusive en ml et démarche éco-responsable.
- **Partie 2 — Catégories & Types** : Contenances (*Short drinks* < 100 ml, *Long drinks* ≥ 100 ml) et moments de service (*Before Dinner*, *After Dinner*, *All Day Cocktail*).
- **Partie 3 — Familles de cocktails** : Structures et compositions types (Sour, Fizz, Colada, Julep, Tiki, Smash, Old-Fashioned, Flip, Collins, Daisy...) avec harmonisation pédagogique des eaux-de-vie.
- **Partie 4 — Méthodes de réalisation** : Les 4 techniques fondamentales (Shaker, Verre à mélange, Direct au verre, Blender) et l'ordonnancement exact des gestes professionnels (mirer, rafraîchir, égoutter, verser, exprimer).
- **Partie 5 — Verrerie de service** : Reconnaissance visuelle et technique des verres incontournables (Nick & Nora, Rocks, Highball, Coupe, Flûte, Mule...) et verres complémentaires (Copa, Absinthe, Toddy, Hurricane, Julep...).
- **Partie 6 — Matériel & Ustensiles du barman** : Identification stricte des shakers (Boston, Continental, Cobbler 3 pièces), des passoires (Hawthorne / passoire à cocktail, Julep, Passoire fine), jiggers, bar spoons, pilons, etc.
- **Partie 7 — Fiches Cocktails de référence** : Atelier d'entraînement interactif complet sur les **36 cocktails cultes** (18 Short Drinks & 18 Long Drinks) avec saisie exacte des dosages en ml, sélection de la méthode, du type, du TAV et de la garniture.
- **Partie 8 — Calcul du TAV (Titre Alcoométrique Volumique)** : Maîtrise de la formule mathématique officielle, calcul des volumes d'alcool pur et exercices pratiques sur les cocktails du socle (Americano 13 %, Dry Martini 35 %, Negroni 26 %, Cosmopolitan 27 %, Piña Colada 13 %).
- **Partie 9 — Lexique professionnel** : Dictionnaire des termes techniques du bar (Albédos, Aquafaba, Cuban roll, Dry shake, Reverse dry shake, Fat washing, Float, Muter, Pre-batch, Zeste, Émulsionner...).

---

## ⚡ Modes de Révision Intelligents
- **Mode Grand Mix** : Génère une session aléatoire de 15 questions tirées de l'ensemble des modules pour tester sa polyvalence.
- **Mode Mes Erreurs** : Stocke automatiquement les questions échouées dans un bac de révision ciblé pour garantir un ancrage mémoriel à 100 %.
- **Réinitialisation de la progression** : Bouton *Reset* en haut à droite permettant de remettre à zéro ses scores, son historique d'erreurs et ses fiches maîtrisées.

---

## 🍹 Explorateur & Fiches des 36 Cocktails Cultes
- Moteur de recherche temps réel tolérant aux accents, cédilles, apostrophes et traits d'union (ex : *Piña Colada*, *Daïquiri*, *Old-Fashioned*, *Horse's Neck*).
- Filtres rapides par spiritueux de base (Gin, Rhum, Vodka, Whisky / Bourbon, Tequila) ou par contenance (Short Drinks / Long Drinks).
- Fiches techniques complètes avec dosages officiels en ml, méthode, verrerie, type de glaçons, garniture, technique de réalisation et anecdote historique.

---

## 🛠️ Robustesse Pédagogique & Expérience Utilisateur
- **Règle Zéro Parenthèse** : Absence totale de parenthèses dans l'interface, les questions, réponses et explications conformément aux exigences de clarté pédagogique.
- **Synthèse Vocale & Audio Web API** : Retours sonores tactiles immersifs pour les validations, erreurs et clics.
- **Persistance LocalStorage** : Sauvegarde automatique de la progression hors ligne, sans nécessité de créer un compte.
- **Design Responsive & Dark Mode** : Interface mobile-first optimisée pour smartphones, tablettes et ordinateurs de bord de bar.

---

## 🚀 Installation & Lancement Local

### Prérequis
- Un navigateur web moderne (Chrome, Safari, Firefox, Edge).
- Optionnel : Node.js ou Python pour lancer un serveur local.

### Lancement direct
Vous pouvez simplement ouvrir le fichier `index.html` dans votre navigateur.

### Lancement avec un serveur local (Recommandé)
```bash
# Avec Node.js
node scratch/server.js

# Ou avec Python
python -m http.server 3000
```
Rendez-vous ensuite sur `http://localhost:3000`.

---

## 📁 Structure du Projet

```text
QCMCOMPLETMIXOLOGIE/
├── index.html            # Structure HTML5 & vues de l'application
├── styles.css            # Styles CSS3 modernes (Flexbox, Grid, Thème Sombre)
├── app.js                # Logique applicative, moteur de QCM, recherche & persistance
├── data.js               # Données structurées pour le navigateur (Modules, 141 Questions, 36 Cocktails, Lexique)
├── app_data.json         # Base de données source au format JSON
├── build_dataset.py      # Script de compilation et validation du jeu de données
├── README.md             # Documentation officielle du projet (v1.2.0)
└── images/               # Banques d'images officielles (matériels, verres, cocktails)
```

---

## 📜 Référence Pédagogique

Conforme au **Référentiel Officiel des Cocktails Classiques de Référence (Édition 2025/2026)** établi pour les examens et concours de la filière Bar & Restauration en France.
