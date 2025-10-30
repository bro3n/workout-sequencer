<template>
  <div v-if="recentLaunches.length > 0" class="space-y-4">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
      {{ $t("home.recentWorkouts.title") }}
    </h2>
    <p class="text-sm text-gray-600 dark:text-gray-400">
      {{ $t("home.recentWorkouts.subtitle") }}
    </p>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="launch in recentLaunches"
        :key="launch.sequenceId"
        class="hover:shadow-lg transition-shadow"
        :class="{
          'opacity-50': !launch.sequence,
        }"
      >
        <template #header>
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white truncate">
                {{ launch.sequenceName }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatLaunchDate(launch.launchedAt) }}
              </p>
            </div>
            <UBadge
              v-if="launch.sequence?.type === 'warmup'"
              color="warning"
              variant="subtle"
              size="xs"
            >
              {{ $t("sequences.warmupBadge") }}
            </UBadge>
          </div>
        </template>

        <div v-if="launch.sequence" class="space-y-2 text-sm">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <UIcon name="i-heroicons-queue-list" class="w-4 h-4" />
            <span>
              {{ launch.sequence.exercises.length }}
              {{ $t("sequences.exercises") }}
            </span>
          </div>

          <div
            v-if="launch.sequence.cycleRepetitions && launch.sequence.cycleRepetitions > 1"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-300"
          >
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
            <span>
              {{ launch.sequence.cycleRepetitions }}
              {{ $t("sequences.cycles") }}
            </span>
          </div>

          <div
            v-if="launch.sequence.breakDuration && launch.sequence.breakDuration > 0"
            class="flex items-center gap-2 text-gray-600 dark:text-gray-300"
          >
            <UIcon name="i-heroicons-pause-circle" class="w-4 h-4" />
            <span>
              {{ launch.sequence.breakDuration }}s
              {{ $t("sequences.breakBetween") }}
            </span>
          </div>
        </div>

        <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
          {{ $t("home.recentWorkouts.sequenceDeleted") }}
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton
              v-if="launch.sequence"
              :to="`/workout/${launch.sequenceId}`"
              color="primary"
              block
              icon="i-heroicons-play"
            >
              {{ $t("home.recentWorkouts.restart") }}
            </UButton>
            <UButton
              v-else
              disabled
              color="neutral"
              variant="ghost"
              block
            >
              {{ $t("home.recentWorkouts.unavailable") }}
            </UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n();
const { getRecentLaunches } = useWorkoutStorage();

// Récupérer les lancements récents
const recentLaunches = ref(getRecentLaunches());

// Rafraîchir les données lorsque la page devient visible
onMounted(() => {
  // Écouter les changements dans le localStorage
  const handleStorageChange = () => {
    recentLaunches.value = getRecentLaunches();
  };

  window.addEventListener('storage', handleStorageChange);
  
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
  });
});

// Formater la date de lancement
const formatLaunchDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  return new Intl.DateTimeFormat(locale.value, options).format(date);
};

// Rafraîchir les données à chaque fois que le composant devient visible
onActivated(() => {
  recentLaunches.value = getRecentLaunches();
});
</script>