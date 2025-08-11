<template>
  <section class="pt-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Barre de recherche principale style Google -->
    <div class="mb-4 sm:mb-10">
      <div class="mx-auto max-w-2xl">
        <div class="group relative">
          <div class="relative">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher dans Vie Publique"
              class="custom-shadow w-full py-4 pl-12 pr-16 text-base transition-all duration-200 placeholder:text-gray-400 hover:shadow-md focus:border-blue-500 focus:shadow-lg focus:outline-none focus:ring-0 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400"
              @keyup.enter="performSearch"
            />
            <UButton
              v-if="searchQuery.trim()"
              @click="performSearch"
              size="sm"
              color="primary"
              icon="i-heroicons-magnifying-glass"
              class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            />
          </div>
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
            <span
              class="text-sm font-medium transition-colors"
              :class="getTextColor(card.title)"
            >
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
const searchQuery = ref("");

// Fonction de recherche
const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(
      `/recherche-avancee?q=${encodeURIComponent(searchQuery.value)}`,
    );
  }
};

// Utilisation du composable centralisé pour les données de navigation
const { navigationCards, getCardStyles, getIconColor, getTextColor } =
  useNavigationCards();
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
