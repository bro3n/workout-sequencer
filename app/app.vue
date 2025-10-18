<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <NuxtRouteAnnouncer />

    <!-- Header de navigation -->
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      <div class="container mx-auto px-6 py-4">
        <nav class="flex justify-between items-center">
          <div class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ $t("nav.title") }}
          </div>
          
          <!-- Navigation desktop -->
          <div class="hidden lg:flex gap-4 items-center">
            <NuxtLink
              to="/"
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {{ $t("nav.home") }}
            </NuxtLink>
            <NuxtLink
              to="/sequences"
              class="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {{ $t("nav.sequences") }}
            </NuxtLink>
            <NuxtLink
              to="/create-sequence"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {{ $t("nav.create") }}
            </NuxtLink>

            <!-- Sélecteur de langue -->
            <USelectMenu
              :model-value="currentLocaleOption"
              :items="localeOptions"
              :search-input="false"
              @update:model-value="updateLocale"
            />

            <!-- Bouton de contrôle du son -->
            <UButton
              :icon="
                soundEnabled
                  ? 'i-heroicons-speaker-wave'
                  : 'i-heroicons-speaker-x-mark'
              "
              :color="soundEnabled ? 'primary' : 'neutral'"
              :title="
                soundEnabled ? $t('common.soundOff') : $t('common.soundOn')
              "
              variant="ghost"
              @click="toggleSound"
            />

            <!-- Bouton de basculement dark/light mode -->
            <UButton
              :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              :title="isDark ? $t('common.lightMode') : $t('common.darkMode')"
              variant="ghost"
              @click="toggleDark"
            />
          </div>

          <!-- Menu burger mobile -->
          <MobileMenu
            :locale-options="localeOptions"
            :current-locale-option="currentLocaleOption"
            :update-locale="updateLocale"
            :sound-enabled="soundEnabled"
            :toggle-sound="toggleSound"
            :is-dark="isDark"
            :toggle-dark="toggleDark"
          />
        </nav>
      </div>
    </header>

    <!-- Contenu principal -->
    <main class="container mx-auto px-6 py-8 flex-1">
      <NuxtPage />
    </main>

    <!-- Footer collé en bas -->
    <footer
      class="bg-white dark:bg-gray-800 shadow-sm border-t border-gray-200 dark:border-gray-700 mt-auto"
    >
      <div class="container mx-auto px-6 py-4">
        <div class="text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2025 {{ $t('footer.copyright') }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Gestion de l'internationalisation
const { locale, locales, setLocale } = useI18n();

// Map des drapeaux par code de langue
const flagMap: Record<string, string> = {
  fr: "🇫🇷",
  en: "🇬🇧",
};

const localeOptions = computed(() =>
  locales.value.map((locale) => {
    const code = typeof locale === "string" ? locale : locale.code;
    const name =
      typeof locale === "string" ? locale : locale.name || locale.code;
    return {
      label: `${flagMap[code]} ${name}`,
      value: code,
    };
  })
);

const currentLocaleOption = computed(() =>
  localeOptions.value.find((opt) => opt.value === locale.value)
);

const updateLocale = (option: { label: string; value: string }) => {
  locale.value = option.value as "fr" | "en";
  setLocale(locale.value);
};

// Gestion du mode sombre avec Nuxt UI
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");

const toggleDark = () => {
  if (colorMode.value === "dark") {
    colorMode.preference = "light";
  } else {
    colorMode.preference = "dark";
  }
};

// Gestion du son global
const soundEnabled = useState("soundEnabled", () => true);

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
};
</script>
