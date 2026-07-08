<script setup lang="ts">
import type { Document } from '~~/types/document';

const { items: budgetDocuments, loading, error } = useCmsCollection<Document>({
  collection: 'documents',
  filters: { family: 'budget' },
  sort: '-publish_date',
  limit: 3,
});
</script>

<template>
  <div>
    <!-- Loading skeleton -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-3">
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
    <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">
        Une erreur est survenue lors du chargement des documents.
      </p>
    </div>

    <!-- No documents -->
    <div
      v-else-if="!budgetDocuments || budgetDocuments.length === 0"
      class="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800"
    >
      <UIcon name="i-heroicons-document-text" class="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <p class="text-gray-600 dark:text-gray-400">Aucun document disponible pour le moment</p>
    </div>

    <!-- Documents grid -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <UCard
        v-for="doc in budgetDocuments"
        :key="doc.id"
        class="border-primary/20 hover:border-primary/30 border-1 cursor-pointer overflow-hidden bg-white transition hover:shadow-lg dark:bg-gray-800"
      >
        <NuxtLink
          :to="`/documents/${doc.id}/${doc.slug}`"
          class="flex flex-row sm:flex-col"
        >
          <!-- Cover image -->
          <div class="mb-0 mr-4 w-1/3 flex-shrink-0 sm:mb-4 sm:mr-0 sm:w-full">
            <CmsImage
              v-if="doc.cover_image"
              :src="doc.cover_image"
              :fallback="'/default-image-2.gif'"
              :alt="doc.title || 'Document budget'"
              class="h-20 w-full rounded-md object-cover sm:h-48"
              sizes="300px"
              :placeholder="[300, 300]"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-20 w-full items-center justify-center rounded-md bg-gray-200 sm:h-48 dark:bg-gray-700"
            >
              <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-gray-400 sm:h-12 sm:w-12" />
            </div>
          </div>

          <!-- Title -->
          <div class="flex flex-1 flex-col">
            <p
              class="line-clamp-2 text-sm font-semibold text-gray-900 sm:text-base dark:text-white"
            >
              {{ doc.title }}
            </p>
            <time
              v-if="doc.publish_date"
              class="mt-1 block text-xs text-gray-500 dark:text-gray-400"
            >
              {{ $dateformatWithDayName(doc.publish_date) }}
            </time>
          </div>
        </NuxtLink>
      </UCard>
    </div>

    <!-- Link to all budget documents -->
    <div v-if="budgetDocuments && budgetDocuments.length > 0" class="mt-6 text-center">
      <NuxtLink
        to="/documents/budget"
        class="group inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:ring-gray-400 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 dark:hover:ring-gray-600"
      >
        Voir tous les documents budget
        <UIcon
          name="i-heroicons-arrow-right"
          class="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
        />
      </NuxtLink>
    </div>
  </div>
</template>
