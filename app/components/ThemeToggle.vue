<template>
  <ClientOnly v-if="!colorMode?.forced">
    <div class="flex items-center gap-3">
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

      <!-- Switch de thème style iOS/Material - version réduite -->
      <button
        :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
        class="group relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:bg-gray-700"
        @click="isDark = !isDark"
      >
        <!-- Track du switch -->
        <span
          class="absolute inset-0 rounded-full bg-gradient-to-r transition-all duration-200"
          :class="isDark
            ? 'from-indigo-500 to-purple-600'
            : 'from-yellow-300 to-orange-400'"
        />

        <!-- Indicateur mobile -->
        <span
          class="absolute inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200"
          :class="isDark ? 'translate-x-5' : 'translate-x-0.5'"
        >
          <!-- Icône dans l'indicateur -->
          <UIcon
            :name="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            class="h-2.5 w-2.5 text-gray-700 transition-all duration-200"
            :class="isDark ? 'text-indigo-600' : 'text-orange-500'"
          />
        </span>

        <!-- Icônes de fond dans le track (optionnel - supprimées pour simplifier) -->
      </button>
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
