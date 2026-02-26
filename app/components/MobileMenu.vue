<template>
  <div class="lg:hidden">
    <!-- Bouton burger -->
    <UButton
      :icon="isOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
      variant="ghost"
      size="lg"
      :aria-label="isOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
      @click="toggleMenu"
    />

    <!-- Menu mobile -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" class="fixed inset-0 z-40 bg-black/50" @click="closeMenu" />
    </Transition>

    <!-- Panneau latéral -->
    <Transition
      enter-active-class="transition-transform duration-300"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isOpen"
        class="fixed top-0 right-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto"
      >
        <!-- En-tête du menu -->
        <div
          class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <span class="font-semibold text-gray-900 dark:text-white">Menu</span>
          <UButton
            icon="i-heroicons-x-mark"
            variant="ghost"
            aria-label="Fermer le menu"
            @click="closeMenu"
          />
        </div>

        <!-- Navigation -->
        <nav class="p-4 space-y-2">
          <NuxtLink
            to="/"
            class="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="closeMenu"
          >
            {{ $t("nav.home") }}
          </NuxtLink>
          <NuxtLink
            to="/sequences"
            class="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            @click="closeMenu"
          >
            {{ $t("nav.sequences") }}
          </NuxtLink>
          <NuxtLink
            to="/create-sequence"
            class="block px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-center font-medium"
            @click="closeMenu"
          >
            {{ $t("nav.create") }}
          </NuxtLink>
        </nav>

        <!-- Contrôles -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          <!-- Sélecteur de langue -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t("nav.language") }}
            </label>
            <USelectMenu
              :model-value="currentLocaleOption"
              :items="localeOptions"
              :search-input="false"
              class="w-full"
              @update:model-value="updateLocale"
            />
          </div>

          <!-- Contrôle du volume -->
          <div class="flex items-center gap-3 pt-2">
            <UIcon
              :name="volumeLevel === 0 ? 'i-heroicons-speaker-x-mark' : 'i-heroicons-speaker-wave'"
              class="w-5 h-5 text-gray-600 dark:text-gray-300"
            />
            <input
              type="range"
              min="0"
              max="100"
              :value="volumeLevel"
              class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              @input="updateVolume"
            />
          </div>

          <!-- Bouton de basculement dark/light mode -->
          <div class="flex justify-center pt-2">
            <UButton
              :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              :title="isDark ? $t('common.lightMode') : $t('common.darkMode')"
              variant="ghost"
              size="lg"
              @click="toggleDark"
            />
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
// Props
defineProps<{
  localeOptions: { label: string; value: string }[];
  currentLocaleOption?: { label: string; value: string };
  updateLocale: (option: { label: string; value: string }) => void;
  volumeLevel: number;
  updateVolume: (event: Event) => void;
  isDark: boolean;
  toggleDark: () => void;
}>();

// État du menu
const isOpen = ref(false);

// Méthodes
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

// Fermer le menu lors du changement de route
const route = useRoute();
watch(
  () => route.path,
  () => {
    closeMenu();
  },
);

// Empêcher le scroll du body quand le menu est ouvert
watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

// Cleanup au démontage
onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>
