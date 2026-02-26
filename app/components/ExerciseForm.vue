<template>
  <div class="flex flex-col sm:flex-row gap-4 sm:items-end">
    <!-- Nom de l'exercice -->
    <div class="flex-1 min-w-0">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ $t("sequenceForm.exerciseName") }}
      </label>
      <UInput
        v-model="exerciseName"
        color="success"
        :placeholder="$t('sequenceForm.exerciseNamePlaceholder')"
      />
    </div>

    <!-- Type d'exercice -->
    <div class="w-full sm:w-32">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ $t("sequenceForm.exerciseType") }}
      </label>
      <USelect v-model="exerciseType" :items="typeOptions" />
    </div>

    <!-- Nombre de répétitions -->
    <div v-if="exerciseType === 'repetitions'" class="w-full sm:w-32">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ $t("sequenceForm.repetitions") }}
      </label>
      <UInputNumber
        v-model="repetitions"
        :step="1"
        :min="1"
        placeholder="5"
        controls-position="right"
      />
    </div>

    <!-- Durée en secondes -->
    <div v-else class="w-full sm:w-32">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {{ $t("sequenceForm.duration") }}
      </label>
      <UInputNumber
        v-model="duration"
        :step="1"
        :min="1"
        placeholder="20"
        controls-position="right"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateExercise } from "~/types/workout";

// Props
interface Props {
  exercise: CreateExercise;
}

const props = defineProps<Props>();

// Émissions
const emit = defineEmits<{
  update: [exercise: CreateExercise];
}>();

// Traduction
const { t } = useI18n();

// Options pour le type d'exercice
const typeOptions = computed(() => [
  { label: t("sequenceForm.exerciseTypeRepetitions"), value: "repetitions" },
  { label: t("sequenceForm.exerciseTypeDuration"), value: "duration" },
]);

// État réactif - Utilisation de toRefs pour une meilleure réactivité
const exerciseName = ref(props.exercise.name);
const exerciseType = ref(props.exercise.type || "repetitions");
const repetitions = ref(props.exercise.repetitions || 5);
const duration = ref(props.exercise.duration || 20);

// Synchroniser avec les props quand elles changent
watch(
  () => props.exercise,
  (newExercise) => {
    exerciseName.value = newExercise.name;
    exerciseType.value = newExercise.type || "repetitions";
    repetitions.value = newExercise.repetitions || 5;
    duration.value = newExercise.duration || 20;
  },
  { deep: true },
);

// Debug: Watcher pour le type
watch(exerciseType, (newType, oldType) => {
  console.log(`Type d'exercice changé de ${oldType} à ${newType}`);
});

// Solution alternative : utiliser un timeout pour debounce
let timeoutId: number | null = null;

watch([exerciseName, exerciseType, repetitions, duration], () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    const exerciseData: CreateExercise = {
      name: exerciseName.value,
      type: exerciseType.value,
    };

    if (exerciseType.value === "repetitions") {
      exerciseData.repetitions = repetitions.value;
    } else {
      exerciseData.duration = duration.value;
    }

    emit("update", exerciseData);
    timeoutId = null;
  }, 0);
});
</script>
