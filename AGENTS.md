# AGENTS.md - Workout Sequencer

## Vue d'ensemble du projet

**Workout Sequencer** est une application web moderne construite avec Nuxt 4 et Vue 3, conçue pour créer, gérer et exécuter des séquences d'entraînement avec une interface intuitive et des fonctionnalités puissantes.

### Fonctionnalités principales

- **Création de workouts personnalisés** : Conception de séquences d'entraînement personnalisées avec plusieurs exercices
- **Gestion des exercices** : Ajout d'exercices avec durée, périodes de repos et répétitions configurables
- **Lecteur de workout** : Lecteur interactif avec timer, suivi de progression et signaux audio/visuels
- **Import/Export** : Partage de workouts via fichiers JSON ou URLs directes
- **Support multilingue** : Disponible en anglais, français, espagnol et chinois
- **Design responsive** : Fonctionne parfaitement sur desktop et mobile
- **Stockage local** : Sauvegarde automatique des workouts dans le navigateur
- **Workouts récents** : Accès rapide à l'historique des workouts
- **Estimation de durée** : Calcul automatique du temps estimé pour chaque séquence dans la liste

## Architecture technique

### Stack technologique
- **Framework** : Nuxt 4.1.2
- **Runtime** : Vue 3.5.21 avec TypeScript 5.9.2
- **Styling** : Tailwind CSS + Nuxt UI 3.3.4
- **Linting** : ESLint 9.35.0 avec configuration Nuxt
- **Type** : Module ESM

### Structure du projet
```
workout-sequencer/
├── app/
│   ├── app.vue              # Composant racine de l'application
│   ├── app.config.ts        # Configuration de l'application
│   ├── components/          # Composants Vue
│   │   ├── ExerciseForm.vue
│   │   ├── WorkoutPlayer.vue
│   │   ├── SequenceForm.vue
│   │   ├── ExportSequenceModal.vue
│   │   ├── ImportSequenceModal.vue
│   │   ├── ImportFromUrlModal.vue
│   │   ├── MobileMenu.vue
│   │   └── RecentWorkouts.vue
│   ├── composables/         # Composables Vue
│   │   └── useWorkoutStorage.ts
│   ├── pages/               # Pages de l'application
│   │   ├── index.vue
│   │   ├── create-sequence.vue
│   │   ├── sequences.vue
│   │   ├── edit-sequence/[id].vue
│   │   └── workout/[id].vue
│   ├── types/               # Définitions TypeScript
│   │   └── workout.ts
│   └── assets/
│       └── css/
│           └── main.css
│   │   └── useSequenceUtils.ts
├── locales/                 # Fichiers de traduction i18n
│   ├── en.json
│   ├── fr.json
│   ├── es.json
│   └── zh.json
├── public/                  # Assets statiques
├── nuxt.config.ts          # Configuration Nuxt
└── package.json            # Dépendances et scripts
```

## Composants et fonctionnalités

### Composants principaux

1. **ExerciseForm.vue** : Formulaire de création/édition d'exercices
   - Gestion du nom de l'exercice
   - Configuration de la durée (secondes/minutes)
   - Définition du temps de repos
   - Validation des champs

2. **SequenceForm.vue** : Formulaire de création/édition de séquences
   - Nom et description de la séquence
   - Gestion de la liste d'exercices
   - Configuration du nombre de répétitions
   - Actions de sauvegarde/annulation

3. **WorkoutPlayer.vue** : Lecteur de workout interactif
   - Timer avec compte à rebours
   - Affichage de l'exercice en cours
   - Barre de progression
   - Contrôles lecture/pause/reset
   - Signaux audio et visuels
   - Navigation entre exercices

4. **ExportSequenceModal.vue** : Modal d'export de séquences
   - Export au format JSON
   - Génération d'URL de partage
   - Copie dans le presse-papiers

5. **ImportSequenceModal.vue** : Modal d'import depuis fichier
   - Import de fichiers JSON
   - Validation de la structure
   - Prévisualisation avant import

6. **ImportFromUrlModal.vue** : Modal d'import depuis URL
   - Import depuis URL de partage
   - Validation et parsing
   - Gestion des erreurs

7. **RecentWorkouts.vue** : Liste des workouts récents
   - Historique des workouts
   - Accès rapide
   - Actions de suppression/édition
   - Estimation du temps via `useSequenceUtils`

8. **MobileMenu.vue** : Menu mobile responsive
   - Navigation adaptative
   - Sélecteur de langue
   - Menu hamburger

### Composables

#### useWorkoutStorage.ts
Gestion du stockage local des workouts :
- Sauvegarde automatique dans localStorage
- Récupération des workouts sauvegardés
- Gestion de l'historique
- Opérations CRUD sur les séquences

#### useSequenceUtils.ts
Utilitaires partagés pour les séquences :
- `estimateSequenceDuration(sequence)` : calcule le temps estimé d'une séquence (durée en secondes, répétitions × 2s, pauses entre exercices, pauses entre cycles) et retourne une chaîne formatée (`Xs`, `Xmin` ou `Xmin Ys`)
- Utilisé dans `sequences.vue` et `RecentWorkouts.vue`
- Auto-importé par Nuxt (aucun import explicite nécessaire)

### Types TypeScript

#### workout.ts
Définitions des types pour :
- `Exercise` : Structure d'un exercice
- `WorkoutSequence` : Structure d'une séquence complète
- `WorkoutSession` : Session de workout en cours

### Pages

1. **index.vue** : Page d'accueil
   - Présentation de l'application
   - Accès rapide aux fonctionnalités
   - Workouts récents

2. **create-sequence.vue** : Création de nouvelle séquence
   - Formulaire de création
   - Gestion des exercices
   - Sauvegarde

3. **sequences.vue** : Liste de toutes les séquences
   - Affichage des séquences sauvegardées
   - Actions d'édition/suppression/lecture
   - Import/Export
   - Estimation du temps via `useSequenceUtils`

4. **edit-sequence/[id].vue** : Édition d'une séquence existante
   - Chargement de la séquence
   - Modification des exercices
   - Mise à jour

5. **workout/[id].vue** : Lecteur de workout
   - Exécution de la séquence
   - Timer et progression
   - Contrôles interactifs

### Modules Nuxt intégrés

1. **@nuxt/eslint** : Configuration ESLint intégrée
2. **@nuxt/ui** : Bibliothèque de composants UI
3. **@nuxtjs/tailwindcss** : Intégration Tailwind CSS

## Internationalisation (i18n)

L'application supporte 4 langues :
- **en.json** : Anglais
- **fr.json** : Français
- **es.json** : Espagnol
- **zh.json** : Chinois

### Configuration i18n
Les traductions couvrent :
- Navigation et menus
- Formulaires et labels
- Messages d'erreur et de validation
- Instructions du lecteur de workout
- Boutons et actions

### Règle importante
Tout texte visible par l'utilisateur doit passer par i18n. Lors de l'ajout d'une nouvelle clé, mettre à jour les **4 fichiers** (`en.json`, `fr.json`, `es.json`, `zh.json`).

## Gestion de l'état

### LocalStorage
Utilisation de localStorage pour :
- Persistance des séquences créées
- Sauvegarde de l'historique
- Préférences utilisateur
- Langue sélectionnée

### Composable useWorkoutStorage
Interface principale pour :
```typescript
- loadSequences(): WorkoutSequence[]
- saveSequence(sequence: WorkoutSequence): void
- deleteSequence(id: string): void
- getSequenceById(id: string): WorkoutSequence | null
```

## Scripts disponibles

```bash
npm run dev      # Serveur de développement (localhost:3000)
npm run build    # Build de production
npm run generate # Génération statique
npm run preview  # Aperçu de la build de production
```

## Configuration

### nuxt.config.ts
Configuration principale de l'application :
- Modules Nuxt activés
- Configuration de routing
- Options de build
- Variables d'environnement

### app.config.ts
Configuration de l'application :
- Thème et couleurs
- Configuration UI
- Paramètres globaux

### tailwind.config.ts
Configuration Tailwind CSS :
- Personnalisation du thème
- Extensions de classes
- Plugins

## Bonnes pratiques

### Développement
- Utiliser TypeScript pour le typage fort
- Suivre la convention de nommage Vue/Nuxt
- Composants réutilisables et modulaires
- Props et emits typés
- Validation des données utilisateur

### Performance
- Lazy loading des composants
- Images optimisées
- Bundle splitting automatique
- SSR/SSG pour meilleure performance

### Accessibilité
- Navigation au clavier
- Labels ARIA appropriés
- Contraste des couleurs
- Responsive design

## Extensions futures possibles

1. **Authentification utilisateur** : Synchronisation cloud des workouts
2. **Base de données** : Stockage persistant côté serveur
3. **Statistiques** : Suivi des performances et progression
4. **Workouts prédéfinis** : Bibliothèque de templates
5. **Partage social** : Intégration réseaux sociaux
6. **Notifications** : Rappels et notifications push
7. **Mode hors ligne** : PWA avec service workers
8. **Export vidéo** : Génération de vidéos d'exercices
