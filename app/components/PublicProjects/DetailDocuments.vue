<script setup lang="ts">
import type { PublicProjectDocument } from '~~/types/public-project';

interface Props {
  documentPrimary: PublicProjectDocument | null;
  documents: PublicProjectDocument[];
}

const props = defineProps<Props>();

const allDocuments = computed(() => {
  const docs: PublicProjectDocument[] = [];
  if (props.documentPrimary) {
    docs.push(props.documentPrimary);
  }
  // Ajouter les documents liés sauf le document principal (éviter doublon)
  for (const doc of props.documents) {
    if (!props.documentPrimary || doc.id !== props.documentPrimary.id) {
      docs.push(doc);
    }
  }
  return docs;
});

const hasDocuments = computed(() => allDocuments.value.length > 0);
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">Documents liés</h3>

    <div v-if="hasDocuments" class="space-y-2">
      <NuxtLink
        v-for="doc in allDocuments"
        :key="doc.id"
        :to="`/documents/${doc.id}/${doc.slug}`"
        class="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-700"
      >
        <div
          class="bg-primary-100 dark:bg-primary-900/30 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        >
          <UIcon
            name="i-heroicons-document-text"
            class="text-primary-600 dark:text-primary-400 h-5 w-5"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
            {{ doc.title }}
          </p>
          <p
            v-if="documentPrimary && doc.id === documentPrimary.id"
            class="text-primary-600 dark:text-primary-400 text-xs"
          >
            Document principal
          </p>
        </div>
        <UIcon
          name="i-heroicons-arrow-top-right-on-square"
          class="h-4 w-4 shrink-0 text-gray-400"
        />
      </NuxtLink>
    </div>

    <div v-else class="py-8 text-center">
      <UIcon
        name="i-heroicons-document-text"
        class="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600"
      />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun document lié à ce projet.</p>
    </div>
  </div>
</template>
