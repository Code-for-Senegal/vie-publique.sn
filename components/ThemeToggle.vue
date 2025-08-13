<template>
  <ClientOnly v-if="!colorMode?.forced">
    <div class="flex items-center gap-2">
      <!-- Bouton de recherche -->
      <UButton
        class="text-white hover:text-gray-200"
        color="white"
        variant="ghost"
        size="sm"
        icon="i-heroicons-magnifying-glass"
        to="/recherche-avancee"
        aria-label="Rechercher"
      />

      <!-- Bouton de thème -->
      <UButton
        :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
        :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
        color="neutral"
        variant="ghost"
        class="dark:text-white-900 text-white"
        @click="isDark = !isDark"
      />
    </div>

    <template #fallback>
      <div class="h-8 w-8" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set() {
    colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
  },
});
</script>
