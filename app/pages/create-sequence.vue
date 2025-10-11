<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('createSequence.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        {{ $t('createSequence.subtitle') }}
      </p>
    </div>

    <!-- Message de feedback -->
    <div v-if="message" class="mb-6">
      <div
        :class="[
          'p-4 rounded-lg border',
          messageType === 'success'
            ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100'
            : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100'
        ]"
      >
        {{ message }}
      </div>
    </div>

    <SequenceForm ref="sequenceFormRef" @save="handleSaveSequence" />
  </div>
</template>

<script setup lang="ts">
import type {
  CreateWorkoutSequence,
  WorkoutSequence,
  CreateExercise,
} from "~/types/workout";

// Nom du composant pour éviter le warning Nuxt
defineOptions({
  name: "CreateSequencePage",
});

// Utiliser le composable de stockage
const { saveSequence } = useWorkoutStorage();

// Référence au formulaire
const sequenceFormRef = ref<{ reset: () => void } | null>(null);

// État pour les messages
const message = ref('');
const messageType = ref<'success' | 'error' | ''>('');

// Fonction pour gérer la sauvegarde d'une séquence
const handleSaveSequence = (sequenceData: CreateWorkoutSequence) => {
  console.log("create-sequence.vue - Réception de l'événement save:", sequenceData);

  try {
    // Créer la séquence complète avec les IDs et dates
    const sequence: WorkoutSequence = {
      id: crypto.randomUUID(),
      name: sequenceData.name,
      type: sequenceData.type || 'workout',
      exercises: sequenceData.exercises.map((ex: CreateExercise) => ({
        ...ex,
        id: crypto.randomUUID(),
      })),
      breakDuration: sequenceData.breakDuration,
      cycleBreakDuration: sequenceData.cycleBreakDuration,
      cycleRepetitions: sequenceData.cycleRepetitions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Séquence créée:", sequence);

    // Sauvegarder dans le localStorage
    const success = saveSequence(sequence);

    if (success) {
      console.log("Séquence sauvegardée avec succès dans localStorage");
      
      // Vérifier que la sauvegarde a bien fonctionné
      const sequences = JSON.parse(localStorage.getItem('workout-sequences') || '[]');
      console.log("Séquences en localStorage:", sequences);

      // Afficher un message de succès
      message.value = $t('createSequence.successMessage', { name: sequence.name });
      messageType.value = 'success';

      // Réinitialiser le formulaire après succès
      if (sequenceFormRef.value) {
        sequenceFormRef.value.reset();
      }

      // Effacer le message après 5 secondes
      setTimeout(() => {
        message.value = '';
        messageType.value = '';
      }, 5000);

    } else {
      console.error("Erreur lors de la sauvegarde de la séquence");
      message.value = $t('createSequence.errorSave');
      messageType.value = 'error';
    }
  } catch (error) {
    console.error("Erreur lors de la création de la séquence:", error);
    message.value = $t('createSequence.errorCreate');
    messageType.value = 'error';
  }
};
</script>
