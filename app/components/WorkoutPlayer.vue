<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <!-- Écran de transition entre échauffement et séquence -->
    <div v-if="isTransitionPhase" class="text-center py-12">
      <div class="mb-8">
        <div class="text-6xl mb-6">🎯</div>
        <h2 class="text-3xl font-bold text-white mb-4">
          {{ $t("workout.warmupCompleted") }}
        </h2>
        <p class="text-xl text-gray-300 mb-8">
          {{ $t("workout.readyForMain") }}
        </p>
        <UButton
          @click="startMainSequence"
          color="primary"
          size="xl"
          icon="i-heroicons-play"
        >
          {{ $t("workout.startMainSequence") }}
        </UButton>
      </div>
    </div>

    <!-- En-tête avec nom de la séquence -->
    <div v-if="!isTransitionPhase" class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <UBadge v-if="isWarmupPhase" color="warning" variant="soft">
          {{ $t("sequences.warmupBadge") }}
        </UBadge>
        <h2 class="text-2xl font-bold text-white">{{ activeSequence.name }}</h2>
      </div>
      <div class="space-y-3">
        <div v-if="!isCompleted" class="text-gray-600 dark:text-gray-300">
          <span
            >{{ $t("sequences.exercisesList") }}
            {{ currentExerciseIndex + 1 }} /
            {{ activeSequence.exercises.length }}</span
          >
          <span v-if="cycleRepetitions > 1" class="ml-2">
            ({{ $t("workout.cycle") }} {{ currentCycle }} /
            {{ cycleRepetitions }})
          </span>
        </div>
        <div v-if="!isCompleted && !isCountdown" class="flex gap-2 justify-end">
          <UButton
            v-if="!isRunning"
            @click="startWorkout"
            color="primary"
            icon="i-heroicons-play"
          >
            {{ isPaused ? $t("workout.resume") : $t("workout.start") }}
          </UButton>
          <template v-else>
            <UButton
              @click="togglePause"
              color="warning"
              variant="outline"
              icon="i-heroicons-pause"
            >
              {{ $t("workout.pause") }}
            </UButton>
            <UButton
              @click="openStopModal"
              color="error"
              variant="outline"
              icon="i-heroicons-stop"
            >
              {{ $t("workout.stop") }}
            </UButton>
          </template>
        </div>
      </div>
    </div>

    <!-- Compte à rebours de démarrage -->
    <div v-if="isCountdown && !isTransitionPhase" class="text-center mb-8">
      <div class="mb-8">
        <h3 class="text-4xl font-bold text-white mb-8 animate-pulse">
          {{ $t("workout.prepareYourself") }}
        </h3>
        <div class="text-9xl font-bold animate-slide-in">
          {{ countdownEmoji }}
        </div>
      </div>
    </div>

    <!-- Pause active -->
    <div
      v-if="isBreak && !isCompleted && !isCountdown && !isTransitionPhase"
      class="text-center mb-8"
    >
      <div class="mb-4 flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-pause" class="w-8 h-8 text-yellow-500" />
        <h3 class="text-3xl font-bold text-yellow-500">
          {{ $t("workout.break") }}
        </h3>
      </div>
      <div class="text-8xl font-bold text-yellow-500">
        {{ formatTime(timeLeft) }}
      </div>
      <div class="text-xl text-gray-600 dark:text-gray-300 mt-4">
        {{ $t("workout.prepareNext") }}
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4">
        <div
          class="bg-yellow-500 h-4 rounded-full transition-all duration-1000"
          :style="{ width: breakProgressPercentage + '%' }"
        ></div>
      </div>
      <!-- Affichage du prochain exercice -->
      <div
        v-if="nextExerciseName"
        class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
      >
        <p class="text-sm text-blue-800 dark:text-blue-300 mb-1">
          {{ $t("workout.nextExercise") }} :
        </p>
        <p class="text-2xl font-bold text-blue-900 dark:text-blue-100">
          {{ nextExerciseName }}
        </p>
      </div>
    </div>

    <!-- Exercice actuel -->
    <div
      v-if="
        currentExercise &&
        !isBreak &&
        !isCountdown &&
        !isTransitionPhase &&
        (isRunning || isPaused)
      "
      class="text-center mb-8"
    >
      <h3 class="text-3xl font-bold text-white mb-4">
        {{ currentExercise.name }}
      </h3>

      <!-- Message d'encouragement -->
      <div v-if="isRunning" class="mb-6 text-2xl animate-pulse">
        {{ encouragementMessage }}
      </div>

      <!-- Affichage pour exercice en répétitions -->
      <div v-if="currentExercise.type === 'repetitions'" class="space-y-4">
        <div class="text-6xl font-bold text-blue-500">
          {{ currentExercise.repetitions }}
        </div>
        <div class="text-xl text-gray-600 dark:text-gray-300">
          {{
            currentExercise.repetitions && currentExercise.repetitions > 1
              ? $t("workout.repetitions")
              : $t("workout.repetition")
          }}
        </div>
        <UButton
          v-if="isRunning"
          @click="nextExercise"
          color="success"
          size="xl"
          class="mt-6"
        >
          {{ getNextButtonLabel }}
        </UButton>
      </div>

      <!-- Affichage pour exercice en durée avec timer -->
      <div v-else class="space-y-4">
        <div class="text-8xl font-bold" :class="timeLeftClass">
          {{ formatTime(timeLeft) }}
        </div>
        <div class="text-xl text-gray-600 dark:text-gray-300">
          {{ $t("workout.secondsRemaining") }}
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-4">
          <div
            class="bg-blue-500 h-4 rounded-full transition-all duration-1000"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Message de fin -->
    <div v-if="isCompleted && !isTransitionPhase" class="text-center space-y-4">
      <div class="text-4xl">🎉</div>
      <h3 class="text-2xl font-bold text-green-500">
        {{
          isWarmupPhase
            ? $t("workout.warmupCompleted")
            : $t("workout.completed")
        }}
      </h3>
      <p class="text-gray-600 dark:text-gray-300">
        {{ $t("workout.congratulations") }}
      </p>
      <div v-if="!isWarmupPhase" class="flex flex-col sm:flex-row gap-3 justify-center">
        <UButton @click="addOneCycle" color="success" icon="i-heroicons-plus">
          {{ $t("workout.addOneCycle") }}
        </UButton>
        <UButton @click="resetWorkout" color="primary" icon="i-heroicons-arrow-path">
          {{ $t("workout.restart") }}
        </UButton>
      </div>
    </div>

    <!-- Liste des exercices avec statut -->
    <div v-if="!isTransitionPhase" class="mt-8">
      <h4 class="text-lg font-semibold text-white mb-4">
        {{ $t("workout.progression") }}
      </h4>
      <div class="space-y-2">
        <div
          v-for="(exercise, index) in activeSequence.exercises"
          :key="exercise.id"
          class="flex items-center gap-3 p-3 rounded-lg"
          :class="getExerciseStatusClass(index)"
        >
          <div class="flex-shrink-0">
            <UIcon
              :name="getExerciseStatusIcon(index)"
              :class="getExerciseStatusIconClass(index)"
              class="w-5 h-5"
            />
          </div>
          <div class="flex-1">
            <span class="font-medium">{{ exercise.name }}</span>
            <span class="text-sm text-gray-600 dark:text-gray-400 ml-2">
              <template v-if="exercise.type === 'repetitions'">
                {{ exercise.repetitions }}
                {{
                  exercise.repetitions && exercise.repetitions > 1
                    ? $t("workout.repetitions")
                    : $t("workout.repetition")
                }}
              </template>
              <template v-else>
                {{ exercise.duration }}
                {{
                  exercise.duration && exercise.duration > 1
                    ? $t("workout.seconds")
                    : $t("workout.second")
                }}
              </template>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation d'arrêt -->
    <UModal v-model:open="stopModalOpen" :title="$t('workout.stopModalTitle')">
      <template #body>
        <p class="text-gray-700 dark:text-gray-300">
          {{ $t("workout.stopModalMessage") }}
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            :label="$t('workout.stopModalCancel')"
            color="neutral"
            variant="outline"
            @click="cancelStop"
          />
          <UButton
            :label="$t('workout.stopModalConfirm')"
            color="error"
            @click="confirmStop"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { WorkoutSequence } from "~/types/workout";

// Props
interface Props {
  sequence: WorkoutSequence;
  warmupSequence?: WorkoutSequence | null;
}

const props = defineProps<Props>();

// Émissions
const emit = defineEmits<{
  complete: [];
  close: [];
  warmupComplete: [];
}>();

// État de la phase (échauffement ou séquence principale)
const currentPhase = ref<"warmup" | "main" | "transition">("warmup");
const isWarmupPhase = computed(() => currentPhase.value === "warmup");
const isTransitionPhase = computed(() => currentPhase.value === "transition");

// Séquence active (échauffement ou séquence principale)
const activeSequence = computed(() => {
  if (currentPhase.value === "warmup" && props.warmupSequence) {
    return props.warmupSequence;
  }
  return props.sequence;
});

// Initialiser la phase au montage
onMounted(() => {
  if (props.warmupSequence) {
    currentPhase.value = "warmup";
  } else {
    currentPhase.value = "main";
  }
});

// Audio pour les sons de notification
const beepCountdownAudio = ref<HTMLAudioElement | null>(null);
const beepEndAudio = ref<HTMLAudioElement | null>(null);
const beepStartAudio = ref<HTMLAudioElement | null>(null);

// État du workout
const isRunning = ref(false);
const isPaused = ref(false);
const isCompleted = ref(false);
const currentExerciseIndex = ref(0);
const timeLeft = ref(0);
const timerId = ref<ReturnType<typeof setInterval> | null>(null);
const isBreak = ref(false);
const breakTotalDuration = ref(0);
const currentCycle = ref(1);
const cycleRepetitions = computed(
  () => activeSequence.value.cycleRepetitions || 1
);

// État du compte à rebours
const isCountdown = ref(false);
const countdownValue = ref(3);

// État de la modal d'arrêt
const stopModalOpen = ref(false);
const wasPausedBeforeStop = ref(false);

// Fonction pour démarrer la séquence principale après l'échauffement
const startMainSequence = () => {
  currentPhase.value = "main";
  resetWorkout();
  // Le workout se lancera automatiquement via le bouton "Démarrer"
};

// Récupérer l'état global du son
const soundEnabled = useState<boolean>("soundEnabled");

// Initialiser les sons au montage du composant
onMounted(() => {
  // Créer des AudioContext pour générer des bips
  const audioContext = new AudioContext();

  // Fonction pour créer un bip avec une fréquence et durée spécifiques
  const createBeep = (frequency: number, duration: number): Blob => {
    const sampleRate = audioContext.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * 1.1;
    }

    // Convertir en WAV
    const wavData = audioBufferToWav(audioBuffer);
    return new Blob([wavData], { type: "audio/wav" });
  };

  // Fonction helper pour convertir AudioBuffer en WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const result = new ArrayBuffer(44 + length);
    const view = new DataView(result);
    const channels: Float32Array[] = [];
    let offset = 0;
    let pos = 0;

    // Écrire l'en-tête WAV
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(36 + length); // file length
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // chunk length
    setUint16(1); // PCM
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length);

    // Écrire les données audio
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < result.byteLength) {
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const sample = Math.max(-1, Math.min(1, channels[i]?.[offset] ?? 0));
        view.setInt16(
          pos,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true
        );
        pos += 2;
      }
      offset++;
    }

    return result;
  };

  // Créer les trois types de bips
  const countdownBeep = createBeep(800, 0.1); // Bip court aigu pour compte à rebours
  const endBeep = createBeep(1200, 0.3); // Bip plus long et plus aigu pour fin
  const startBeep = createBeep(600, 0.2); // Bip moyen grave pour début

  beepCountdownAudio.value = new Audio(URL.createObjectURL(countdownBeep));
  beepEndAudio.value = new Audio(URL.createObjectURL(endBeep));
  beepStartAudio.value = new Audio(URL.createObjectURL(startBeep));
});

// Récupérer le niveau de volume global
const volumeLevel = useState<number>("volumeLevel");

// WakeLock pour empêcher la mise en veille de l'écran pendant le workout
const wakeLockSentinel = ref<WakeLockSentinel | null>(null);

const acquireWakeLock = async () => {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLockSentinel.value = await navigator.wakeLock.request("screen");
  } catch {
    console.debug("");
  }
};

const releaseWakeLock = async () => {
  if (wakeLockSentinel.value) {
    try {
      await wakeLockSentinel.value.release();
    } catch {
      console.debug("");
    }
    wakeLockSentinel.value = null;
  }
};

// Acquérir/libérer le WakeLock selon l'état du workout
watch(isRunning, async (running) => {
  if (running) {
    await acquireWakeLock();
  } else {
    await releaseWakeLock();
  }
});

// Réacquérir le WakeLock si la page redevient visible (il est relâché automatiquement quand la page est cachée)
const handleVisibilityChange = async () => {
  if (document.visibilityState === "visible" && isRunning.value) {
    await acquireWakeLock();
  }
};

onMounted(() => {
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

// Fonction pour jouer un son
const playBeep = (type: "countdown" | "end" | "start") => {
  // Ne rien faire si le son est désactivé
  if (!soundEnabled.value) return;

  try {
    let audio: HTMLAudioElement | null = null;

    switch (type) {
      case "countdown":
        audio = beepCountdownAudio.value;
        break;
      case "end":
        audio = beepEndAudio.value;
        break;
      case "start":
        audio = beepStartAudio.value;
        break;
    }

    if (audio) {
      audio.currentTime = 0;
      // Appliquer le niveau de volume (0-100 converti en 0-1)
      audio.volume = (volumeLevel.value || 100) / 100;
      audio.play().catch((err) => console.log("Erreur lecture audio:", err));
    }
  } catch (error) {
    console.log("Erreur audio:", error);
  }
};

// Computed
const currentExercise = computed(() => {
  if (currentExerciseIndex.value < activeSequence.value.exercises.length) {
    return activeSequence.value.exercises[currentExerciseIndex.value];
  }
  return null;
});

const progressPercentage = computed(() => {
  if (!currentExercise.value || currentExercise.value.type !== "duration") {
    return 0;
  }
  const totalTime = currentExercise.value.duration || 0;
  return ((totalTime - timeLeft.value) / totalTime) * 100;
});

const breakProgressPercentage = computed(() => {
  if (breakTotalDuration.value === 0) return 0;
  return (
    ((breakTotalDuration.value - timeLeft.value) / breakTotalDuration.value) *
    100
  );
});

// Nom du prochain exercice (pour l'affichage pendant la pause)
const nextExerciseName = computed(() => {
  // Vérifier qu'on est bien en pause
  if (!isBreak.value) return null;

  // Le prochain exercice est celui à currentExerciseIndex (qui a déjà été incrémenté)
  if (currentExerciseIndex.value < activeSequence.value.exercises.length) {
    return activeSequence.value.exercises[currentExerciseIndex.value]?.name || null;
  }

  return null;
});

const timeLeftClass = computed(() => {
  if (timeLeft.value <= 5) {
    return "text-red-500 animate-pulse";
  } else if (timeLeft.value <= 10) {
    return "text-orange-500";
  }
  return "text-blue-500";
});

const getNextButtonLabel = computed(() => {
  const { t } = useI18n();
  const isLastExercise =
    currentExerciseIndex.value >= activeSequence.value.exercises.length - 1;
  const hasBreakDuration = (activeSequence.value.breakDuration || 0) > 0;
  const isLastCycle = currentCycle.value >= cycleRepetitions.value;

  if (isLastExercise && isLastCycle) {
    return t("workout.finish");
  } else if (isLastExercise && !isLastCycle) {
    return `${t("workout.nextCycle")} (${currentCycle.value + 1}/${
      cycleRepetitions.value
    })`;
  } else if (hasBreakDuration) {
    return `${t("workout.launchBreak")} (${
      activeSequence.value.breakDuration
    }s)`;
  } else {
    return t("workout.nextExercise");
  }
});

// Message d'encouragement aléatoire
const { t } = useI18n();
const encouragementMessage = ref("");

// Fonction pour générer un nouveau message d'encouragement
const updateEncouragementMessage = () => {
  const messages = [
    t("workout.encouragement1"),
    t("workout.encouragement2"),
    t("workout.encouragement3"),
    t("workout.encouragement4"),
    t("workout.encouragement5"),
    t("workout.encouragement6"),
    t("workout.encouragement7"),
    t("workout.encouragement8"),
    t("workout.encouragement9"),
    t("workout.encouragement10"),
    t("workout.encouragement11"),
  ];

  let randomIndex = Math.floor(Math.random() * messages.length);
  if (encouragementMessage.value === messages[randomIndex]) {
    randomIndex = Math.floor(Math.random() * messages.length);
  }
  encouragementMessage.value = messages[randomIndex] || "";
};

// Mettre à jour le message à chaque changement d'exercice
watch(currentExerciseIndex, () => {
  updateEncouragementMessage();
});

// Initialiser le message au montage
onMounted(() => {
  updateEncouragementMessage();
});

// Computed pour l'emoji du compte à rebours
const countdownEmoji = computed(() => {
  switch (countdownValue.value) {
    case 3:
      return "☝️";
    case 2:
      return "✌️";
    case 1:
      return "🤘";
    default:
      return "🚀";
  }
});

// Fonctions
const startWorkout = () => {
  // Si on reprend après une pause, ne pas lancer le compte à rebours
  if (!isPaused.value) {
    // Lancer le compte à rebours
    startCountdown();
  } else {
    // Reprendre le timer où on l'avait laissé
    isPaused.value = false;
    isRunning.value = true;
    startTimer();
  }
};

const startCountdown = () => {
  isCountdown.value = true;
  countdownValue.value = 3;

  const countdownTimer = setInterval(() => {
    if (countdownValue.value > 1) {
      countdownValue.value--;
      playBeep("countdown");
    } else {
      clearInterval(countdownTimer);
      isCountdown.value = false;

      // Démarrer le workout
      isRunning.value = true;
      isCompleted.value = false;
      currentExerciseIndex.value = 0;
      startCurrentExercise();
    }
  }, 1000);
};

const togglePause = () => {
  if (isRunning.value) {
    // Mettre en pause
    isPaused.value = true;
    isRunning.value = false;
    if (timerId.value) {
      clearInterval(timerId.value);
      timerId.value = null;
    }
  }
};

// Ouvrir la modal de confirmation d'arrêt
const openStopModal = () => {
  // Sauvegarder l'état de pause actuel
  wasPausedBeforeStop.value = isPaused.value;

  // Si l'entraînement est en cours, le mettre en pause
  if (isRunning.value) {
    togglePause();
  }

  stopModalOpen.value = true;
};

// Annuler l'arrêt et reprendre l'entraînement
const cancelStop = () => {
  stopModalOpen.value = false;

  // Si l'entraînement n'était pas en pause avant, le reprendre
  if (!wasPausedBeforeStop.value && isPaused.value) {
    startWorkout();
  }
};

// Confirmer l'arrêt de l'entraînement
const confirmStop = () => {
  stopModalOpen.value = false;
  stopWorkout();
};

const stopWorkout = () => {
  isRunning.value = false;
  isPaused.value = false;
  currentExerciseIndex.value = 0;
  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = null;
  }
  // Réinitialiser l'état de pause pour éviter d'afficher les infos de pause
  isBreak.value = false;
  breakTotalDuration.value = 0;
};

const resetWorkout = () => {
  stopWorkout();
  isPaused.value = false;
  currentExerciseIndex.value = 0;
  currentCycle.value = 1;
  isCompleted.value = false;
  timeLeft.value = 0;
  isBreak.value = false;
  breakTotalDuration.value = 0;
};

// Fonction pour ajouter un cycle supplémentaire
const addOneCycle = () => {
  // Réinitialiser l'état de complétion et remettre à zéro l'index
  isCompleted.value = false;
  currentExerciseIndex.value = 0;
  currentCycle.value++;
  
  // Démarrer le compte à rebours pour le nouveau cycle
  startCountdown();
};

const startCurrentExercise = () => {
  const exercise = currentExercise.value;
  if (!exercise) return;

  isBreak.value = false;

  // Attendre 400ms avant de jouer le son de début pour éviter la superposition avec le son de fin
  setTimeout(() => {
    playBeep("start");
  }, 400);

  if (exercise.type === "duration") {
    timeLeft.value = exercise.duration || 0;
    startTimer();
  }
};

const startBreak = (isCycleBreak: boolean = false) => {
  const breakDuration = isCycleBreak
    ? activeSequence.value.cycleBreakDuration || 0
    : activeSequence.value.breakDuration || 0;

  if (breakDuration <= 0) {
    // Pas de pause configurée, passer directement à l'exercice suivant
    proceedToNextExercise();
    return;
  }

  isBreak.value = true;
  timeLeft.value = breakDuration;
  breakTotalDuration.value = breakDuration;
  startTimer();
};

const proceedToNextExercise = () => {
  currentExerciseIndex.value++;

  if (currentExerciseIndex.value >= activeSequence.value.exercises.length) {
    // Fin du cycle actuel, vérifier s'il faut répéter
    if (currentCycle.value < cycleRepetitions.value) {
      // Passer au cycle suivant
      currentCycle.value++;
      currentExerciseIndex.value = 0;

      // Ajouter une pause entre les cycles si configurée
      const hasCycleBreakDuration =
        (activeSequence.value.cycleBreakDuration || 0) > 0;
      if (hasCycleBreakDuration) {
        startBreak(true);
      } else {
        startCurrentExercise();
      }
    } else {
      // Tous les cycles terminés
      isRunning.value = false;
      isCompleted.value = true;
      
      // Nettoyer le timer pour éviter qu'il continue
      if (timerId.value) {
        clearInterval(timerId.value);
        timerId.value = null;
      }

      // Si on termine l'échauffement, passer à la transition
      if (isWarmupPhase.value) {
        currentPhase.value = "transition";
        emit("warmupComplete");
      } else {
        emit("complete");
      }
    }
  } else {
    // Exercice suivant dans le cycle actuel
    startCurrentExercise();
  }
};

const startTimer = () => {
  if (timerId.value) {
    clearInterval(timerId.value);
  }

  timerId.value = setInterval(() => {
    timeLeft.value--;

    // Jouer un bip pour les 3 dernières secondes (sauf pour les pauses)
    if (!isBreak.value && timeLeft.value > 0 && timeLeft.value <= 3) {
      playBeep("countdown");
    }

    if (timeLeft.value <= 0) {
      clearInterval(timerId.value!);
      timerId.value = null;

      if (isBreak.value) {
        // Fin de la pause, démarrer l'exercice actuel (sans incrémenter)
        startCurrentExercise();
      } else {
        // Fin de l'exercice, jouer le son de fin puis gérer la transition
        playBeep("end");
        nextExercise();
      }
    }
  }, 1000);
};

const nextExercise = () => {
  if (timerId.value) {
    clearInterval(timerId.value);
    timerId.value = null;
  }

  // Vérifier si on doit ajouter une pause
  const isLastExercise =
    currentExerciseIndex.value >= activeSequence.value.exercises.length - 1;
  const hasBreakDuration = (activeSequence.value.breakDuration || 0) > 0;

  if (!isLastExercise && hasBreakDuration) {
    // Pas le dernier exercice et pause configurée : incrémenter puis démarrer la pause
    currentExerciseIndex.value++;
    startBreak();
  } else {
    // Dernier exercice ou pas de pause : passer directement au suivant
    proceedToNextExercise();
  }
};

const getExerciseStatusClass = (index: number) => {
  if (index < currentExerciseIndex.value) {
    return "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700";
  } else if (index === currentExerciseIndex.value && isRunning.value) {
    return "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700";
  }
  return "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600";
};

const getExerciseStatusIcon = (index: number) => {
  if (index < currentExerciseIndex.value) {
    return "i-heroicons-check-circle";
  } else if (index === currentExerciseIndex.value && isRunning.value) {
    return "i-heroicons-play-circle";
  }
  return "i-heroicons-clock";
};

const getExerciseStatusIconClass = (index: number) => {
  if (index < currentExerciseIndex.value) {
    return "text-green-500";
  } else if (index === currentExerciseIndex.value && isRunning.value) {
    return "text-blue-500";
  }
  return "text-gray-400";
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Nettoyage
onUnmounted(() => {
  if (timerId.value) {
    clearInterval(timerId.value);
  }
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  releaseWakeLock();
});
</script>
