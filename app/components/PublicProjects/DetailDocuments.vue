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
    <h3 class="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
      <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-gray-400" />
      Documents liés
    </h3>

    <div v-if="hasDocuments" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <NuxtLink
        v-for="doc in allDocuments"
        :key="doc.id"
        :to="`/documents/${doc.id}/${doc.slug}`"
        class="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] dark:bg-gray-800 dark:ring-gray-700 sm:hover:shadow-md"
      >
        <!-- Badge document principal -->
        <span
          v-if="documentPrimary && doc.id === documentPrimary.id"
          class="bg-primary-500 absolute left-1.5 top-1.5 z-10 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white shadow"
        >
          Principal
        </span>

        <!-- Cover -->
        <div class="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
          <CmsImage
            v-if="doc.coverImage"
            :src="doc.coverImage"
            :quality="40"
            :alt="doc.title"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <UIcon
              name="i-heroicons-document-text"
              class="h-10 w-10 text-gray-300 dark:text-gray-600"
            />
          </div>
        </div>

        <!-- Content -->
        <div class="p-2.5">
          <h4
            class="group-hover:text-primary-600 line-clamp-2 text-xs font-semibold leading-snug text-gray-900 dark:text-white sm:text-sm"
          >
            {{ doc.title }}
          </h4>
        </div>
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
