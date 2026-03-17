# TalentIA — Projet React

Plateforme de mise en relation étudiants / entreprises propulsée par l'IA.

## Structure du projet

```
talentia/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                          # Composant racine
│   ├── index.js                         # Point d'entrée React
│   ├── styles.css                       # Styles globaux + variables CSS
│   │
│   ├── data/
│   │   └── cvData.js                    # Données CV simulées + constantes
│   │
│   ├── utils/
│   │   └── experience.js               # calcExpMois() + formatMois()
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── ui/                          # Composants réutilisables
│   │   │   ├── Logo.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Field.jsx
│   │   │   └── Toggle.jsx
│   │   │
│   │   ├── sections/                    # Sections de la landing page
│   │   │   ├── Hero.jsx
│   │   │   └── Sections.jsx            # HowItWorks, Features, Testimonials, CTA
│   │   │
│   │   └── modal/                       # Flow d'inscription
│   │       ├── Modal.jsx               # Conteneur principal
│   │       ├── ProgressBar.jsx
│   │       └── steps/
│   │           ├── StepCV.jsx          # Étape 1 : Dépôt CV + analyse IA
│   │           ├── StepCompte.jsx      # Étape 2 : Compte (pré-rempli)
│   │           ├── StepProfil.jsx      # Étape 3 : Profil académique
│   │           ├── StepSkills.jsx      # Étape 4 : Compétences & langues
│   │           ├── StepPrefs.jsx       # Étape 5 : Préférences
│   │           └── StepDone.jsx        # Étape 6 : Succès
│   │
└── package.json
```

## Lancer le projet

```bash
npm install
npm start
```

## Fonctionnalités clés

- **Analyse CV par IA** : extraction de firstName, lastName, email, phone, dateOfBirth, address, city, profilePicture, niveau, université, langues
- **Calcul durée expérience** : `calcExpMois()` calcule la durée totale en mois depuis les dates début/fin
- **Flow signup 6 étapes** avec barre de progression horizontale
- **Palette** : teal `#0d9488` (logo/nav), gold `#D4AF37` (modal interactions), aucun violet
