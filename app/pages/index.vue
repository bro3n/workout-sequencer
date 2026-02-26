<template>
  <div>
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-6">
        {{ $t("welcome.title") }}
      </h1>

      <p class="text-xl text-gray-600 dark:text-gray-300 mb-8">
        {{ $t("welcome.subtitle") }}
      </p>
    </div>

    <!-- Composant des entraînements récents -->
    <div class="max-w-6xl mx-auto mb-12">
      <RecentWorkouts />
    </div>

    <div class="text-center">
      <div class="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {{ $t("home.createCard.title") }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ $t("home.createCard.description") }}
          </p>
          <NuxtLink
            to="/create-sequence"
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {{ $t("home.createCard.button") }}
          </NuxtLink>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {{ $t("home.sequencesCard.title") }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            {{ $t("home.sequencesCard.description") }}
          </p>
          <NuxtLink
            to="/sequences"
            class="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {{ $t("home.sequencesCard.button") }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page d'accueil du Workout Sequencer

// Nom du composant pour éviter le warning Nuxt
defineOptions({
  name: "HomePage",
});
</script>
