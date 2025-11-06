<template>
  <section class="pb-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Barre de recherche principale style Google/ChatGPT -->
    <div class="flex justify-center">
      <div class="w-full sm:max-w-2xl">
        <div class="group relative">
          <div class="relative">
            <!-- Icône décorative gauche - disparaît quand on tape -->
            <UIcon
              v-if="!searchQuery.trim()"
              name="i-heroicons-magnifying-glass"
              class="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-all group-focus-within:text-blue-500"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher dans Vie Publique..."
              :class="[
                'w-full rounded-full border-2 border-gray-200 bg-white py-4 pr-20 text-base shadow-sm transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-md focus:border-blue-500 focus:shadow-lg focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:hover:border-gray-500 dark:focus:border-blue-400',
                searchQuery.trim() ? 'pl-5' : 'pl-14',
              ]"
              @keyup.enter="performSearch"
            />
            <!-- Bouton de recherche - apparaît quand on tape -->
            <button
              v-if="searchQuery.trim()"
              class="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-blue-700 text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700"
              @click="performSearch"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Suggestions de recherche optionnelles -->
        <div class="mt-4 flex hidden flex-wrap justify-center gap-2 opacity-75">
          <button
            v-for="suggestion in searchSuggestions"
            :key="suggestion"
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click="
              searchQuery = suggestion;
              performSearch();
            "
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>

    <!-- Liens rapides style boutons subtils -->
    <div class="hidden">
      <div class="mx-auto max-w-5xl">
        <!-- Grille responsive des liens -->
        <div class="flex flex-wrap justify-center gap-2 sm:gap-3">
          <NuxtLink
            v-for="card in navigationCards"
            :key="card.title"
            :to="card.to"
            class="group flex items-center gap-2 rounded-full border bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:translate-y-[-1px] hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            :class="getCardStyles(card.title)"
          >
            <UIcon
              :name="card.icon"
              class="h-4 w-4 transition-transform group-hover:scale-110"
              :class="getIconColor(card.title)"
            />
            <span class="text-sm font-medium transition-colors" :class="getTextColor(card.title)">
              {{ card.title }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const router = useRouter();

// État de la recherche
const searchQuery = ref('');

// Suggestions de recherche populaires
const searchSuggestions = ref([
  'Assemblée nationale',
  'Budget 2024',
  'Journal officiel',
  'Décrets',
  'Elections',
]);

// Fonction de recherche
const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/recherche-avancee?q=${encodeURIComponent(searchQuery.value)}`);
  }
};

// Utilisation du composable centralisé pour les données de navigation
const { navigationCards, getCardStyles, getIconColor, getTextColor } = useNavigationCards();
</script>

<style scoped>
/* Animation subtile pour les boutons */
@keyframes pulse-soft {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-soft {
  animation: pulse-soft 3s ease-in-out infinite;
}
</style>
