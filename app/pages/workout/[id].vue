<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <!-- Header avec retour -->
    <div class="mb-6">
      <UButton
        to="/sequences"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        class="mb-4"
      >
        {{ $t('workout.backToSequences') }}
      </UButton>
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
      <p class="text-gray-600 dark:text-gray-300">{{ $t('workout.loading') }}</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="text-center py-12">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-red-600 mb-2">{{ $t('workout.notFound') }}</h2>
      <p class="text-gray-600 dark:text-gray-300 mb-4">{{ error }}</p>
      <UButton to="/sequences" color="primary">
        {{ $t('workout.backToSequences') }}
      </UButton>
    </div>

    <!-- Sélection d'échauffement (uniquement pour les séquences normales) -->
    <div v-else-if="sequence && sequence.type === 'workout' && !workoutStarted" class="mb-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-xl font-semibold text-white mb-4">
          {{ $t('workout.addWarmup') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ $t('workout.warmupDescription') }}
        </p>
        
        <div v-if="warmupSequences.length > 0" class="space-y-3 mb-4">
          <div
            v-for="warmup in warmupSequences"
            :key="warmup.id"
            class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            :class="{ 'bg-blue-50 dark:bg-blue-900 border-blue-500': selectedWarmupId === warmup.id }"
            @click="selectedWarmupId = warmup.id"
          >
            <div>
              <h4 class="font-medium text-white">{{ warmup.name }}</h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ warmup.exercises.length }} {{ $t('sequences.exercises') }}
              </p>
            </div>
            <UIcon
              v-if="selectedWarmupId === warmup.id"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-blue-500"
            />
          </div>
        </div>
        
        <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
          <p>{{ $t('workout.noWarmupAvailable') }}</p>
          <p class="text-sm mt-2">{{ $t('workout.createWarmupHint') }}</p>
        </div>
        
        <div class="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
          <UButton
            @click="startWorkout(false)"
            variant="outline"
            class="flex-1"
          >
            {{ $t('workout.startWithoutWarmup') }}
          </UButton>
          <UButton
            v-if="warmupSequences.length > 0"
            @click="startWorkout(true)"
            color="primary"
            class="flex-1"
            :disabled="!selectedWarmupId"
          >
            {{ $t('workout.startWithWarmup') }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Player de workout -->
    <WorkoutPlayer
      v-else-if="sequence && workoutStarted"
      :sequence="sequence"
      :warmup-sequence="selectedWarmup"
      @complete="onWorkoutComplete"
      @close="$router.push('/sequences')"
    />
  </div>
</template>

<script setup lang="ts">
import type { WorkoutSequence } from "~/types/workout";

// Route
const route = useRoute();

// État
const sequence = ref<WorkoutSequence | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const workoutStarted = ref(false);
const selectedWarmupId = ref<string | null>(null);
const warmupSequences = ref<WorkoutSequence[]>([]);
const selectedWarmup = ref<WorkoutSequence | null>(null);
 
// Utiliser le composable de stockage
const { getSequenceById, getWarmupSequences, recordLaunch } = useWorkoutStorage();

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
      sequence.value = foundSequence;
      
      // Charger les échauffements disponibles si c'est une séquence normale
      if (foundSequence.type === 'workout') {
        warmupSequences.value = getWarmupSequences();
      } else {
        // Si c'est un échauffement, démarrer directement
        workoutStarted.value = true;
      }
    }
  } catch (err) {
    error.value = t('editSequence.errorLoading');
    console.error("Erreur:", err);
  } finally {
    loading.value = false;
  }
};

// Démarrer le workout avec ou sans échauffement
const startWorkout = (withWarmup: boolean) => {
  if (withWarmup && selectedWarmupId.value) {
    // Récupérer l'échauffement sélectionné
    const warmup = warmupSequences.value.find(w => w.id === selectedWarmupId.value);
    selectedWarmup.value = warmup || null;
    workoutStarted.value = true;
  } else {
    // Pas d'échauffement
    selectedWarmupId.value = null;
    selectedWarmup.value = null;
    workoutStarted.value = true;
  }
  
  // Enregistrer le lancement dans l'historique
  if (sequence.value) {
    recordLaunch(sequence.value.id, sequence.value.name);
  }
};

// Gestionnaire de fin de workout
const onWorkoutComplete = () => {
  // Vous pouvez ajouter ici de la logique pour enregistrer les statistiques
  console.log("Workout terminé pour la séquence:", sequence.value?.name);
};

// Charger la séquence au montage
onMounted(() => {
  loadSequence();
});

// Watcher pour les changements de route
watch(() => route.params.id, () => {
  if (route.params.id) {
    workoutStarted.value = false;
    selectedWarmupId.value = null;
    loadSequence();
  }
});

// Meta pour la page
definePageMeta({
  name: "WorkoutPage"
});
</script>