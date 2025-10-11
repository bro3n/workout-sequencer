# AGENTS.md - Workout Sequencer

## Vue d'ensemble du projet

**Workout Sequencer** est une application web construite avec Nuxt 4 et Vue 3, conçue pour séquencer et organiser des entraînements. L'application utilise TypeScript pour le typage statique et Tailwind CSS avec Nuxt UI pour l'interface utilisateur.

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
│   ├── app.vue           # Composant racine de l'application
│   ├── app.config.ts     # Configuration de l'application
│   └── components/       # Composants
├── public/               # Assets statiques
├── nuxt.config.ts        # Configuration Nuxt
└── package.json          # Dépendances et scripts
```

## Composants et fonctionnalités

### Modules Nuxt intégrés
1. **@nuxt/eslint** - Configuration ESLint intégrée
2. **@nuxt/ui** - Bibliothèque de composants UI
3. **@nuxtjs/tailwindcss** - Intégration Tailwind CSS

## Scripts disponibles

```bash
npm run dev      # Serveur de développement
npm run build    # Build de production
npm run generate # Génération statique
npm run preview  # Aperçu de la build de production
```
