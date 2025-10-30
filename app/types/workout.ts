// Types pour les données de workout

export interface Exercise {
  id: string;
  name: string;
  type: 'repetitions' | 'duration';
  repetitions?: number;
  duration?: number; // en secondes
}

// Type pour l'historique des lancements de séquences
export interface WorkoutLaunch {
  sequenceId: string;
  sequenceName: string;
  launchedAt: Date;
}

export interface WorkoutSequence {
  id: string;
  name: string;
  type: 'workout' | 'warmup'; // type de séquence: workout (normale) ou warmup (échauffement)
  exercises: Exercise[];
  breakDuration?: number; // durée de pause entre exercices en secondes
  cycleBreakDuration?: number; // durée de pause entre les cycles en secondes
  cycleRepetitions?: number; // nombre de répétitions du cycle d'exercices
  createdAt: Date;
  updatedAt: Date;
}

// Type pour créer une nouvelle séquence (sans les champs auto-générés)
export interface CreateWorkoutSequence {
  name: string;
  type?: 'workout' | 'warmup'; // type de séquence: workout (normale) ou warmup (échauffement), par défaut 'workout'
  exercises: Omit<Exercise, 'id'>[];
  breakDuration?: number; // durée de pause entre exercices en secondes
  cycleBreakDuration?: number; // durée de pause entre les cycles en secondes
  cycleRepetitions?: number; // nombre de répétitions du cycle d'exercices
}

// Type pour créer un nouvel exercice (sans l'id)
export interface CreateExercise {
  name: string;
  type: 'repetitions' | 'duration';
  repetitions?: number;
  duration?: number; // en secondes
}