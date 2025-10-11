<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <form class="space-y-6" @submit.prevent="submitSequence">
      <!-- Nom de la séquence -->
      <div>
        <label
          for="sequenceName"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('sequenceForm.name') }}
        </label>
        <UInput
          id="sequenceName"
          v-model="sequenceName"
          :placeholder="$t('sequenceForm.namePlaceholder')"
          required
          :color="nameError ? 'error' : undefined"
          class="w-full"
        />
        <p v-if="nameError" class="text-xs text-red-600 dark:text-red-400 mt-1">
          {{ nameError }}
        </p>
      </div>

      <!-- Type de séquence -->
      <div>
        <label
          for="sequenceType"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('sequenceForm.type') }}
        </label>
        <USelectMenu
          id="sequenceType"
          v-model="sequenceType"
          :items="sequenceTypeOptions"
          :search-input="false"
          class="w-full"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('sequenceForm.typeHelp') }}
        </p>
      </div>

      <!-- Durée de pause entre exercices -->
      <div>
        <label
          for="breakDuration"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('sequenceForm.breakDuration') }}
        </label>
        <UInputNumber
          id="breakDuration"
          v-model="breakDuration"
          :min="0"
          placeholder="5"
          class="w-full"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('sequenceForm.breakDurationHelp') }}
        </p>
      </div>

      <!-- Nombre de répétitions du cycle ---->
      <div>
        <label
          for="cycleRepetitions"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('sequenceForm.cycleRepetitions') }}
        </label>
        <UInputNumber
          id="cycleRepetitions"
          v-model="cycleRepetitions"
          :min="1"
          placeholder="1"
          class="w-full"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('sequenceForm.cycleRepetitionsHelp') }}
        </p>
      </div>

      <!-- Durée de pause entre cycles -->
      <div v-if="cycleRepetitions > 1">
        <label
          for="cycleBreakDuration"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {{ $t('sequenceForm.cycleBreakDuration') }}
        </label>
        <UInputNumber
          id="cycleBreakDuration"
          v-model="cycleBreakDuration"
          :min="0"
          placeholder="10"
          class="w-full"
        />
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ $t('sequenceForm.cycleBreakDurationHelp') }}
        </p>
      </div>

      <!-- Liste des exercices -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            {{ $t('sequenceForm.exercises') }} ({{ exercises.length }})
          </h3>
          <UButton
            icon="i-heroicons-plus"
            size="sm"
            color="primary"
            @click="addExercise"
          >
            {{ $t('sequenceForm.addExercise') }}
          </UButton>
        </div>

        <!-- Exercices existants -->
        <div v-if="exercises.length > 0" class="space-y-3 mb-4">
          <div
            v-for="(exercise, index) in exercises"
            :key="index"
            class="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <div class="flex-1">
              <ExerciseForm
                :exercise="exercise"
                @update="updateExercise(index, $event)"
              />
            </div>
            <UButton
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              size="sm"
              @click="removeExercise(index)"
            />
          </div>
        </div>

        <!-- Message si aucun exercice -->
        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>
            {{ $t('sequenceForm.noExercises') }}
          </p>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div
        class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600"
      >
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          @click="resetForm"
        >
          {{ $t('sequenceForm.reset') }}
        </UButton>
        <UButton type="submit" :disabled="!canSubmit" :loading="isSubmitting">
          {{ $t('sequenceForm.save') }}
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { CreateWorkoutSequence, CreateExercise } from "~/types/workout";

// Props
interface Props {
  initialData?: CreateWorkoutSequence;
  currentSequenceId?: string; // ID de la séquence en cours d'édition (si en mode édition)
}

const props = defineProps<Props>();

// Émissions
const emit = defineEmits<{
  save: [sequence: CreateWorkoutSequence];
}>();

// Utiliser le composable de stockage
const { getSequences } = useWorkoutStorage();
const { t } = useI18n();

// Options pour le type de séquence
const sequenceTypeOptions = computed(() => [
  t('sequenceForm.typeWorkout'),
  t('sequenceForm.typeWarmup')
]);

// État réactif
const sequenceName = ref(props.initialData?.name || "");
const sequenceType = ref(props.initialData?.type === "warmup" ? t('sequenceForm.typeWarmup') : t('sequenceForm.typeWorkout'));
const exercises = ref<CreateExercise[]>(props.initialData?.exercises || []);
const breakDuration = ref(props.initialData?.breakDuration || 5);
const cycleBreakDuration = ref(props.initialData?.cycleBreakDuration || 10);
const cycleRepetitions = ref(props.initialData?.cycleRepetitions || 1);
const isSubmitting = ref(false);
const nameError = ref<string>("");

// Validation du nom de séquence
const validateSequenceName = (name: string): boolean => {
  if (!name.trim()) {
    nameError.value = "";
    return true;
  }
  
  const existingSequences = getSequences();
  const duplicateName = existingSequences.find(
    (seq) => seq.name.toLowerCase() === name.toLowerCase() && seq.id !== props.currentSequenceId
  );
  
  if (duplicateName) {
    nameError.value = t('sequenceForm.nameError');
    return false;
  }
  
  nameError.value = "";
  return true;
};

// Watcher pour valider le nom en temps réel
watch(sequenceName, (newName) => {
  validateSequenceName(newName);
});

// Fonctions pour gérer les exercices
const addExercise = () => {
  exercises.value.push({
    name: "",
    type: "duration",
    duration: 20,
  });
};

const removeExercise = (index: number) => {
  exercises.value.splice(index, 1);
};

const updateExercise = (index: number, updatedExercise: CreateExercise) => {
  const value = updatedExercise.type === 'repetitions' ? updatedExercise.repetitions : updatedExercise.duration;
  console.info(`updateExercise (${index}): ${updatedExercise.name}, ${updatedExercise.type}: ${value}`);
  exercises.value[index] = updatedExercise;
};

// Validation
const canSubmit = computed(() => {
  console.info("TEST DISABLE");
  return (
    sequenceName.value.trim() !== "" &&
    !nameError.value &&
    exercises.value.length > 0 &&
    exercises.value.every((ex) => {
      const hasValidValue = ex.type === 'repetitions'
        ? (ex.repetitions && ex.repetitions > 0)
        : (ex.duration && ex.duration > 0);
      return ex.name.trim() !== "" && hasValidValue;
    })
  );
});

// Soumission du formulaire
const submitSequence = async () => {
  console.info("TEST");
  if (!canSubmit.value) return;

  isSubmitting.value = true;

  try {
    const sequenceData: CreateWorkoutSequence = {
      name: sequenceName.value.trim(),
      type: sequenceType.value === t('sequenceForm.typeWarmup') ? "warmup" : "workout",
      exercises: exercises.value.map((ex) => {
        const exerciseData: Omit<CreateExercise, 'id'> = {
          name: ex.name.trim(),
          type: ex.type,
        };
        
        if (ex.type === 'repetitions') {
          exerciseData.repetitions = ex.repetitions;
        } else {
          exerciseData.duration = ex.duration;
        }
        
        return exerciseData;
      }),
      breakDuration: breakDuration.value > 0 ? breakDuration.value : undefined,
      cycleBreakDuration: cycleBreakDuration.value > 0 ? cycleBreakDuration.value : undefined,
      cycleRepetitions: cycleRepetitions.value,
    };

    console.log(
      "SequenceForm - Émission de l'événement save avec:",
      sequenceData
    );
    emit("save", sequenceData);
  } finally {
    isSubmitting.value = false;
  }
};

// Fonction pour réinitialiser depuis l'extérieur
const reset = () => {
  resetForm();
};

// Exposer la fonction reset
defineExpose({
  reset,
});

// Réinitialisation du formulaire
const resetForm = () => {
  sequenceName.value = "";
  sequenceType.value = t('sequenceForm.typeWorkout');
  exercises.value = [];
  breakDuration.value = 0;
  cycleBreakDuration.value = 10;
  cycleRepetitions.value = 1;
};

// Ajouter un exercice par défaut au montage si pas de données initiales
onMounted(() => {
  if (!props.initialData || props.initialData.exercises.length === 0) {
    addExercise();
  }
});

// Watcher pour les changements de props
watch(() => props.initialData, (newData) => {
  if (newData) {
    sequenceName.value = newData.name;
    sequenceType.value = newData.type === "warmup" ? t('sequenceForm.typeWarmup') : t('sequenceForm.typeWorkout');
    exercises.value = [...newData.exercises];
    breakDuration.value = newData.breakDuration || 0;
    cycleBreakDuration.value = newData.cycleBreakDuration || 10;
    cycleRepetitions.value = newData.cycleRepetitions || 1;
  }
}, { deep: true });
</script>
