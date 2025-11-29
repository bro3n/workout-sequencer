# Workout Sequencer

A modern web application built with Nuxt 4 and Vue 3 for creating, managing, and executing workout sequences with an intuitive interface and powerful features.

## 🎯 Features

- **Create Custom Workouts**: Design personalized workout sequences with multiple exercises
- **Exercise Management**: Add exercises with customizable duration, rest periods, and repetitions
- **Workout Player**: Interactive player with timer, progress tracking, and audio/visual cues
- **Import/Export**: Share workouts via JSON files or direct URLs
- **Multilingual Support**: Available in English, French, Spanish, and Chinese
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Local Storage**: Automatically saves your workouts in the browser
- **Recent Workouts**: Quick access to your workout history

## 🚀 Tech Stack

- **Framework**: [Nuxt 4.1.2](https://nuxt.com/)
- **UI Framework**: Vue 3.5.21 with TypeScript 5.9.2
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Nuxt UI 3.3.4](https://ui.nuxt.com/)
- **Linting**: ESLint 9.35.0 with Nuxt configuration
- **Module Type**: ESM

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## 🛠️ Setup

Install dependencies:

```bash
npm install
```

## 💻 Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## 🏗️ Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Generate static site:

```bash
npm run generate
```

## 📁 Project Structure

```
workout-sequencer/
├── app/
│   ├── app.vue              # Root application component
│   ├── app.config.ts        # App configuration
│   ├── components/          # Vue components
│   │   ├── ExerciseForm.vue
│   │   ├── WorkoutPlayer.vue
│   │   ├── SequenceForm.vue
│   │   └── ...
│   ├── composables/         # Vue composables
│   │   └── useWorkoutStorage.ts
│   ├── pages/               # Application pages
│   │   ├── index.vue
│   │   ├── create-sequence.vue
│   │   ├── sequences.vue
│   │   └── workout/[id].vue
│   └── types/               # TypeScript definitions
│       └── workout.ts
├── locales/                 # i18n translation files
│   ├── en.json
│   ├── fr.json
│   ├── es.json
│   └── zh.json
├── public/                  # Static assets
├── nuxt.config.ts          # Nuxt configuration
└── package.json            # Dependencies and scripts
```

## 🎮 Usage

1. **Create a Workout**:
   - Navigate to "Create Sequence"
   - Add a workout name and description
   - Add exercises with duration and rest periods
   - Configure repetitions if needed
   - Save your workout

2. **Play a Workout**:
   - Select a workout from your list
   - Click "Start" to begin the workout
   - Follow the on-screen timer and instructions
   - Audio and visual cues guide you through each exercise

3. **Import/Export Workouts**:
   - Export your workouts as JSON files
   - Share workout URLs with others
   - Import workouts from files or URLs

## 🌐 Internationalization

The application supports multiple languages. Change the language using the language selector in the navigation menu. Translation files are located in the `locales/` directory.

## 📝 Configuration

### Nuxt Modules

The project uses the following Nuxt modules:
- `@nuxt/ui` - UI component library
- `@nuxt/eslint` - ESLint integration
- `@nuxtjs/tailwindcss` - Tailwind CSS integration

Configuration can be modified in [`nuxt.config.ts`](nuxt.config.ts).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🔗 Resources

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Nuxt UI Documentation](https://ui.nuxt.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## 📧 Support

For questions or issues, please open an issue on the project repository.
