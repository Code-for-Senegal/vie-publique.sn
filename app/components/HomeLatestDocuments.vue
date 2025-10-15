<script setup lang="ts">
import { useLatestUpdatesStore } from "~/stores/latestUpdates";

const store = useLatestUpdatesStore();

// Fonction pour formater la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

onMounted(() => {
  store.fetchUpdates();
});
</script>

<template>
  <div class="my-4">
    <div class="prose prose-sm sm:prose-sm mx-auto my-4">
      <h2 class="text-center text-xl text-gray-800 dark:text-white">
        Derniers documents ajoutés
      </h2>
    </div>

    <!-- Loading state -->
    <div v-if="store.isLoading" class="grid gap-4 sm:grid-cols-3">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="flex items-center gap-4">
          <div class="h-8 w-8 rounded-full bg-gray-200"></div>
          <div class="flex-1">
            <div class="h-4 w-3/4 rounded bg-gray-200"></div>
            <div class="mt-2 h-3 w-1/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="store.hasError"
      title="Erreur"
      description="Une erreur est survenue lors du chargement des documents."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Content -->
    <div v-else>
      <div class="grid gap-4 sm:grid-cols-3">
        <div
          v-for="document in store.getLatestDocuments"
          :key="document.id"
          class="custom-shadow group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md dark:bg-gray-800/80 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
        >
          <NuxtLink :to="document.url" class="block h-full p-4">
            <div class="mb-1 flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-blue-50 p-2">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="h-5 w-5 text-blue-600"
                  />
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-300">
                  Ajouté le {{ formatDate(document.date_created) }}
                </span>
              </div>
            </div>
            <h3
              class="mb-2 line-clamp-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              {{ document.title }}
            </h3>
          </NuxtLink>
        </div>
      </div>
      <div class="mt-6 text-center">
        <NuxtLink
          to="/documents/public"
          class="inline-flex items-center gap-2 text-sm font-medium text-green-700 underline"
        >
          Voir tous les documents
          <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
