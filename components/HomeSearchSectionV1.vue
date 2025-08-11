<template>
  <section
    class="bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl text-center">
        <!-- Titre principal -->
        <div class="mb-8">
          <h2
            class="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl dark:text-white"
          >
            Recherchez dans les contenus officiels
          </h2>
          <p
            class="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg dark:text-gray-400"
          >
            Explorez facilement les actualités, documents officiels, décisions
            gouvernementales et données publiques du Sénégal
          </p>
        </div>

        <!-- Barre de recherche principale -->
        <div class="mb-8 sm:mb-10">
          <div class="relative mx-auto max-w-2xl">
            <UInput
              v-model="searchQuery"
              size="xl"
              placeholder="Budget 2024, Assemblée Nationale, Décrets..."
              icon="i-heroicons-magnifying-glass"
              :ui="{
                wrapper: 'relative',
                base: 'text-base sm:text-lg',
                rounded: 'rounded-2xl',
                padding: {
                  xl: 'px-4 py-4 pl-12',
                },
                icon: {
                  leading: {
                    wrapper: 'absolute inset-y-0 left-0 flex items-center',
                    pointer: '',
                    padding: 'pl-4',
                  },
                },
              }"
              class="border-0 bg-white shadow-lg dark:bg-gray-800"
              @keyup.enter="performSearch"
            >
              <template #trailing>
                <UButton
                  @click="performSearch"
                  :disabled="!searchQuery.trim()"
                  size="lg"
                  icon="i-heroicons-arrow-right"
                  class="rounded-xl"
                  :class="
                    searchQuery.trim()
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300'
                  "
                >
                  Rechercher
                </UButton>
              </template>
            </UInput>
          </div>
        </div>

        <!-- Filtres rapides -->
        <div class="mb-8 sm:mb-10">
          <p class="mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            Recherche rapide par catégorie
          </p>
          <div class="flex flex-wrap justify-center gap-3 sm:gap-4">
            <NuxtLink
              to="/recherche-avancee?types=actualite"
              class="group flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:bg-gray-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
            >
              <UIcon
                name="i-heroicons-newspaper"
                class="text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400"
                size="18"
              />
              <span class="text-sm font-medium text-blue-900 dark:text-blue-100"
                >Actualités</span
              >
            </NuxtLink>

            <NuxtLink
              to="/recherche-avancee?types=document"
              class="group flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:bg-gray-800 dark:hover:border-orange-700 dark:hover:bg-orange-900/20"
            >
              <UIcon
                name="i-heroicons-document-text"
                class="text-orange-600 transition-transform group-hover:scale-110 dark:text-orange-400"
                size="18"
              />
              <span
                class="text-sm font-medium text-orange-900 dark:text-orange-100"
                >Documents</span
              >
            </NuxtLink>

            <NuxtLink
              to="/assemblee-nationale"
              class="group flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-2 transition-all duration-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:bg-gray-800 dark:hover:border-green-700 dark:hover:bg-green-900/20"
            >
              <UIcon
                name="i-heroicons-building-library"
                class="text-green-600 transition-transform group-hover:scale-110 dark:text-green-400"
                size="18"
              />
              <span
                class="text-sm font-medium text-green-900 dark:text-green-100"
                >Assemblée</span
              >
            </NuxtLink>

            <NuxtLink
              to="/budget-senegal"
              class="group flex items-center gap-2 rounded-full border border-purple-200 bg-white px-4 py-2 transition-all duration-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:bg-gray-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/20"
            >
              <UIcon
                name="i-heroicons-banknotes"
                class="text-purple-600 transition-transform group-hover:scale-110 dark:text-purple-400"
                size="18"
              />
              <span
                class="text-sm font-medium text-purple-900 dark:text-purple-100"
                >Budget</span
              >
            </NuxtLink>
          </div>
        </div>

        <!-- Suggestions populaires -->
        <div class="mb-8">
          <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Recherches populaires :
          </p>
          <div class="flex flex-wrap justify-center gap-2">
            <UButton
              v-for="suggestion in popularSearches"
              :key="suggestion"
              @click="
                searchQuery = suggestion;
                performSearch();
              "
              size="sm"
              color="gray"
              variant="soft"
              class="text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {{ suggestion }}
            </UButton>
          </div>
        </div>

        <!-- Statistiques -->
        <div
          class="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
        >
          <div
            class="rounded-xl bg-white/50 p-4 text-center backdrop-blur-sm dark:bg-gray-800/50"
          >
            <div
              class="text-xl font-bold text-blue-600 sm:text-2xl dark:text-blue-400"
            >
              {{ stats.totalDocuments }}+
            </div>
            <div
              class="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400"
            >
              Documents
            </div>
          </div>

          <div
            class="rounded-xl bg-white/50 p-4 text-center backdrop-blur-sm dark:bg-gray-800/50"
          >
            <div
              class="text-xl font-bold text-green-600 sm:text-2xl dark:text-green-400"
            >
              {{ stats.totalArticles }}+
            </div>
            <div
              class="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400"
            >
              Actualités
            </div>
          </div>

          <div
            class="rounded-xl bg-white/50 p-4 text-center backdrop-blur-sm dark:bg-gray-800/50"
          >
            <div
              class="text-xl font-bold text-orange-600 sm:text-2xl dark:text-orange-400"
            >
              {{ stats.totalMembers }}+
            </div>
            <div
              class="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400"
            >
              Députés
            </div>
          </div>

          <div
            class="rounded-xl bg-white/50 p-4 text-center backdrop-blur-sm dark:bg-gray-800/50"
          >
            <div
              class="text-xl font-bold text-purple-600 sm:text-2xl dark:text-purple-400"
            >
              24/7
            </div>
            <div
              class="mt-1 text-xs text-gray-600 sm:text-sm dark:text-gray-400"
            >
              Accès
            </div>
          </div>
        </div>

        <!-- Lien vers recherche avancée -->
        <div class="mt-8 sm:mt-10">
          <NuxtLink
            to="/recherche-avancee"
            class="inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <span>Accéder à la recherche avancée</span>
            <UIcon name="i-heroicons-arrow-right" size="16" />
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

// Données populaires (à remplacer par de vraies données)
const popularSearches = [
  "Budget 2024",
  "Assemblée Nationale",
  "Conseil des ministres",
  "Journal Officiel",
  "Élections 2024",
  "OFNAC",
  "Code de la famille",
  "Loi de finances",
];

// Statistiques (à connecter avec de vraies données)
const stats = reactive({
  totalDocuments: "5000",
  totalArticles: "12000",
  totalMembers: "165",
});

// Fonction de recherche
const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(
      `/recherche-avancee?q=${encodeURIComponent(searchQuery.value)}`,
    );
  }
};

// Optionnel : charger des statistiques réelles
onMounted(async () => {
  try {
    // Exemple d'appel API pour récupérer des stats
    // const { data } = await $fetch('/api/stats');
    // if (data) {
    //   Object.assign(stats, data);
    // }
  } catch (error) {
    console.log("Erreur lors du chargement des statistiques");
  }
});
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
