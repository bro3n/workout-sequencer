<template>
  <Transition name="slide-up">
    <div
      v-if="needsRefresh"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl shadow-lg"
    >
      <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 shrink-0" />
      <span class="text-sm font-medium">{{ $t("pwa.updateAvailable") }}</span>
      <UButton size="xs" color="neutral" variant="solid" @click="updateServiceWorker()">
        {{ $t("pwa.updateNow") }}
      </UButton>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { needsRefresh, updateServiceWorker } = usePwa();
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}
</style>
