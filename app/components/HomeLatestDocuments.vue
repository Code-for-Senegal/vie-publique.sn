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
    <div
      v-if="store.isLoading"
      class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0"
    >
      <div
        v-for="n in 3"
        :key="n"
        class="w-64 flex-shrink-0 snap-start animate-pulse md:w-auto md:flex-shrink"
      >
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

    <!-- Documents: défilement horizontal mobile, grille 3 colonnes desktop -->
    <div v-else>
      <div
        class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-x-visible md:pb-0"
      >
        <UCard
          v-for="document in store.getLatestDocuments.slice(0, 3)"
          :key="document.id"
          class="custom-shadow w-64 flex-shrink-0 snap-start cursor-pointer transition hover:shadow-lg md:w-auto md:flex-shrink dark:bg-gray-800/90"
        >
          <NuxtLink :to="document.url" class="flex flex-col">
            <!-- Image -->
            <div class="mb-4 w-full">
              <CmsImage
                v-if="document.cover_image"
                :src="document.cover_image"
                :quality="25"
                :alt="`Aperçu ${document.title}`"
                class="h-36 w-full rounded-md object-cover sm:h-48"
                loading="lazy"
              />
              <img
                v-else-if="document.doc_type === 'official_journal'"
                src="/images/default-journal-officiel.webp"
                :alt="`Aperçu ${document.title}`"
                class="h-36 w-full rounded-md object-cover sm:h-48"
                loading="lazy"
              />
              <div
                v-else
                class="flex h-36 w-full items-center justify-center rounded-md bg-gray-200 sm:h-48 dark:bg-gray-700"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="h-8 w-8 text-gray-400"
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
