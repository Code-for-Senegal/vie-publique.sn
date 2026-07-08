<script setup lang="ts">
import type { Document } from '~~/types/document';

const props = defineProps<{
  documents: Document[];
  electionName?: string;
  loading?: boolean;
}>();
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary-500" />
      <p class="text-sm text-gray-400">Recherche des documents...</p>
    </div>

    <div v-else-if="!documents || documents.length === 0" class="text-center py-20 bg-slate-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-700">
      <UIcon name="i-heroicons-document-magnifying-glass" class="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <p class="text-gray-500 font-bold">Aucun document spécifique n'est encore rattaché à ce scrutin.</p>
      <p class="text-xs text-gray-400 mt-2">Consultez la bibliothèque complète pour les textes généraux.</p>
      <UButton to="/elections-senegal/legislation" class="mt-6 rounded-full" color="black" variant="soft">
        Toute la législation
      </UButton>
    </div>

    <div v-else class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      <NuxtLink
        v-for="doc in documents"
        :key="doc.id"
        :to="`/documents/${doc.id}/${doc.slug}`"
        class="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <!-- Image de couverture -->
        <div class="aspect-[3/2] overflow-hidden bg-gray-100 dark:bg-gray-700">
          <CmsImage
            v-if="doc.cover_image"
            :src="doc.cover_image"
            :quality="40"
            :alt="`Aperçu ${doc.title}`"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700"
          >
            <UIcon
              name="i-heroicons-document-text"
              class="h-8 w-8 text-gray-300 sm:h-10 sm:w-10 dark:text-gray-500"
            />
          </div>
        </div>

        <!-- Contenu -->
        <div class="p-2 sm:p-3">
          <h3
            class="line-clamp-2 text-xs font-semibold leading-tight text-gray-900 sm:text-sm dark:text-white"
          >
            {{ doc.title }}
          </h3>
          <time
            v-if="doc.publish_date"
            :datetime="doc.publish_date"
            class="mt-1 block text-[10px] text-gray-400 sm:text-xs dark:text-gray-500"
          >
            {{ new Date(doc.publish_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </time>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
