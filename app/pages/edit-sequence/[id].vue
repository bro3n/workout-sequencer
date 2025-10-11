<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <!-- Header avec retour -->
    <div class="mb-8">
      <UButton
        to="/sequences"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        class="mb-4"
      >
        {{ $t('editSequence.backToSequences') }}
      </UButton>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        {{ $t('editSequence.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        {{ $t('editSequence.subtitle') }}
      </p>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-300">{{ $t('workout.loading') }}</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-red-600 mb-2">{{ $t('editSequence.notFound') }}</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4">{{ error }}</p>
      <UButton to="/sequences" color="primary">
        {{ $t('editSequence.backToSequences') }}
      </UButton>
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

    <!-- Formulaire d'édition -->
    <SequenceForm
      v-if="sequenceData"
      ref="sequenceFormRef"
      :initial-data="sequenceData"
      :current-sequence-id="route.params.id as string"
      @save="handleUpdateSequence"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  CreateWorkoutSequence,
  WorkoutSequence,
} from "~/types/workout";

// Route
const route = useRoute();

// État
const sequenceData = ref<CreateWorkoutSequence | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const message = ref('');
const messageType = ref<'success' | 'error' | ''>('');

// Référence au formulaire
const sequenceFormRef = ref<{ reset: () => void } | null>(null);

// Utiliser le composable de stockage
const { getSequenceById, updateSequence } = useWorkoutStorage();

// Charger la séquence
const loadSequence = () => {
  const id = route.params.id as string;
  const { t } = useI18n();
  
  if (!id) {
    error.value = t('editSequence.idMissing');
    loading.value = false;
    return;
  }

  try {
    const foundSequence = getSequenceById(id);
    
    if (!foundSequence) {
      error.value = t('editSequence.noSequenceFound', { id });
    } else {
      // Convertir la séquence complète en données d'édition
      sequenceData.value = {
        name: foundSequence.name,
        type: foundSequence.type,
        exercises: foundSequence.exercises.map(ex => ({
          name: ex.name,
          type: ex.type,
          repetitions: ex.repetitions,
          duration: ex.duration
        })),
        breakDuration: foundSequence.breakDuration,
        cycleBreakDuration: foundSequence.cycleBreakDuration,
        cycleRepetitions: foundSequence.cycleRepetitions
      };
    }
  } catch (err) {
    error.value = t('editSequence.errorLoading');
    console.error("Erreur:", err);
  } finally {
    loading.value = false;
  }
};

// Fonction pour gérer la mise à jour d'une séquence
const handleUpdateSequence = (updatedData: CreateWorkoutSequence) => {
  const id = route.params.id as string;
  const { t } = useI18n();
  console.log("edit-sequence.vue - Réception de l'événement save:", updatedData);

  try {
    // Récupérer la séquence originale pour conserver l'ID et les dates
    const originalSequence = getSequenceById(id);
    if (!originalSequence) {
      message.value = t('editSequence.errorNotFound');
      messageType.value = 'error';
      return;
    }

    // Créer la séquence mise à jour
    const updatedSequence: WorkoutSequence = {
      ...originalSequence,
      name: updatedData.name,
      type: updatedData.type || 'workout',
      exercises: updatedData.exercises.map((ex) => ({
        ...ex,
        id: crypto.randomUUID(), // Nouveau ID pour chaque exercice
      })),
      breakDuration: updatedData.breakDuration,
      cycleBreakDuration: updatedData.cycleBreakDuration,
      cycleRepetitions: updatedData.cycleRepetitions,
      updatedAt: new Date(),
    };

    console.log("Séquence mise à jour:", updatedSequence);

    // Sauvegarder dans le localStorage
    const success = updateSequence(updatedSequence);

    if (success) {
      console.log("Séquence mise à jour avec succès dans localStorage");

      // Afficher un message de succès
      message.value = t('editSequence.successMessage', { name: updatedSequence.name });
      messageType.value = 'success';

      // Effacer le message après 5 secondes
      setTimeout(() => {
        message.value = '';
        messageType.value = '';
      }, 5000);

    } else {
      console.error("Erreur lors de la mise à jour de la séquence");
      message.value = t('editSequence.errorUpdate');
      messageType.value = 'error';
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la séquence:", error);
    message.value = t('editSequence.errorUpdate');
    messageType.value = 'error';
  }
};

// Charger la séquence au montage
onMounted(() => {
  loadSequence();
});

// Watcher pour les changements de route
watch(() => route.params.id, () => {
  if (route.params.id) {
    loadSequence();
  }
});

// Meta pour la page
definePageMeta({
  name: "EditSequencePage"
});
</script>