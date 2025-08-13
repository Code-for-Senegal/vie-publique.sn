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

      <!-- Switch de thème style iOS/Material -->
      <button
        @click="isDark = !isDark"
        :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
        class="group relative inline-flex h-7 w-14 items-center rounded-full bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700"
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
          class="absolute inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200"
          :class="isDark ? 'translate-x-8' : 'translate-x-1'"
        >
          <!-- Icône dans l'indicateur -->
          <UIcon
            :name="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
            class="h-3 w-3 text-gray-700 transition-all duration-200"
            :class="isDark ? 'text-indigo-600' : 'text-orange-500'"
          />
        </span>
        
        <!-- Icônes de fond dans le track -->
        <span class="absolute left-1 flex h-5 w-5 items-center justify-center">
          <UIcon
            name="i-lucide-sun"
            class="h-3 w-3 transition-opacity duration-200"
            :class="isDark ? 'text-gray-400 opacity-50' : 'text-white opacity-0'"
          />
        </span>
        <span class="absolute right-1 flex h-5 w-5 items-center justify-center">
          <UIcon
            name="i-lucide-moon"
            class="h-3 w-3 transition-opacity duration-200"
            :class="isDark ? 'text-white opacity-0' : 'text-gray-400 opacity-50'"
          />
        </span>
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
