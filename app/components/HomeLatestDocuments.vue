<script setup lang="ts">
import { useLatestUpdatesStore } from '~/stores/latestUpdates';

const store = useLatestUpdatesStore();

onMounted(() => {
  store.fetchUpdates();
});
</script>

<template>
  <section class="my-4" aria-labelledby="documents-heading">
    <h2
      id="documents-heading"
      class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white"
    >
      Derniers Documents publiés
    </h2>

    <!-- Loading state avec USkeleton -->
    <div
      v-if="store.isLoading || (!store.hasError && store.getLatestDocuments.length === 0)"
      class="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
      aria-busy="true"
      aria-label="Chargement des documents"
    >
      <div
        v-for="n in 3"
        :key="n"
        class="w-40 flex-shrink-0 snap-start rounded-lg bg-white p-3 shadow-sm sm:w-56 md:w-auto md:flex-shrink dark:bg-gray-800"
      >
        <USkeleton class="aspect-[4/3] w-full rounded-md" />
        <div class="mt-3 space-y-2">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
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

    <!-- Documents: scroll horizontal mobile, grille 3 colonnes desktop -->
    <div v-else>
      <div
        class="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
        role="list"
      >
        <UCard
          v-for="document in store.getLatestDocuments.slice(0, 3)"
          :key="document.id"
          role="listitem"
          :ui="{ body: { padding: 'p-3 sm:p-4' } }"
          class="w-40 flex-shrink-0 snap-start transition-transform active:scale-[0.98] sm:w-56 md:w-auto md:flex-shrink"
        >
          <NuxtLink
            :to="document.url"
            class="flex flex-col"
            :aria-label="`Voir le document : ${document.title}`"
          >
            <!-- Image -->
            <div class="mb-3 w-full">
              <CmsImage
                v-if="document.cover_image"
                :src="document.cover_image"
                :quality="25"
                :alt="`Aperçu ${document.title}`"
                class="aspect-[4/3] w-full rounded-md object-cover"
                loading="lazy"
              />
              <img
                v-else-if="document.doc_type === 'official_journal'"
                src="/images/default-journal-officiel.webp"
                :alt="`Aperçu ${document.title}`"
                class="aspect-[4/3] w-full rounded-md object-cover"
                loading="lazy"
              />
              <div
                v-else
                class="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700"
              >
                <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <!-- Title -->
            <h3
              class="line-clamp-2 text-sm font-medium leading-snug text-gray-900 dark:text-white"
            >
              {{ document.title }}
            </h3>
          </NuxtLink>
        </UCard>
      </div>

      <!-- CTA -->
      <div class="mt-6 text-center">
        <UButton
          to="/documents/public"
          color="gray"
          variant="solid"
          size="md"
          trailing-icon="i-heroicons-arrow-right"
          class="bg-white font-medium"
        >
          Voir tous les documents
        </UButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
