<script setup lang="ts">
import { useLatestUpdatesStore } from '~/stores/latestUpdates';

const store = useLatestUpdatesStore();

onMounted(() => {
  store.fetchUpdates();
});
</script>

<template>
  <div class="my-4">
    <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white">
      Derniers Documents publiés
    </h2>

    <!-- Loading state -->
    <div v-if="store.isLoading" class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="rounded-lg bg-gray-200 dark:bg-gray-700">
          <div class="aspect-[16/9] rounded-t-lg bg-gray-300 dark:bg-gray-600"></div>
          <div class="p-4">
            <div class="mb-2 h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600"></div>
            <div class="h-3 w-1/4 rounded bg-gray-300 dark:bg-gray-600"></div>
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

    <!-- Documents grid (3 colonnes desktop, ligne par ligne mobile) -->
    <div v-else>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <UCard
          v-for="document in store.getLatestDocuments.slice(0, 3)"
          :key="document.id"
          class="custom-shadow cursor-pointer transition hover:shadow-lg dark:bg-gray-800/90"
        >
          <NuxtLink :to="document.url" class="flex flex-row sm:flex-col">
            <!-- Image -->
            <div class="mb-0 mr-4 w-1/3 flex-shrink-0 sm:mb-4 sm:mr-0 sm:w-full">
              <CmsImage
                v-if="document.cover_image"
                :src="document.cover_image"
                :quality="25"
                :alt="`Aperçu ${document.title}`"
                class="h-20 w-full rounded-md object-cover sm:h-48"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-20 w-full items-center justify-center rounded-md bg-gray-200 sm:h-48 dark:bg-gray-700"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="h-6 w-6 text-gray-400 sm:h-8 sm:w-8"
                />
              </div>
            </div>

            <!-- Content -->
            <div class="flex flex-1 flex-col">
              <h3
                class="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base dark:text-white"
              >
                {{ document.title }}
              </h3>
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div class="mt-8 text-center">
        <NuxtLink
          to="/documents/public"
          class="group inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:ring-gray-400 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 dark:hover:ring-gray-600"
        >
          Voir tous les documents
          <UIcon
            name="i-heroicons-arrow-right"
            class="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
