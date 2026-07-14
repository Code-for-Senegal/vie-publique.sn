<script setup lang="ts">
import type { Document } from '~~/types/document';

interface Props {
  /** Masque le bouton « Voir tous les documents » (ex. page /documents où le lien est redondant) */
  hideCta?: boolean;
  titleAlign?: 'center' | 'left';
  /** Nombre de documents affichés */
  limit?: number;
  /** Colonnes de la grille desktop (une seule ligne : desktopCols = limit) */
  desktopCols?: 3 | 4;
}
const props = withDefaults(defineProps<Props>(), {
  hideCta: false,
  titleAlign: 'center',
  limit: 6,
  desktopCols: 3,
});

const gridClass = props.desktopCols === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3';

const {
  data: documents,
  pending,
  error,
} = useAsyncData(`latest-documents-${props.limit}`, () =>
  $fetch<{ documents: Document[] }>('/api/documents', {
    params: { limit: props.limit, sort: '-date_created' },
  }).then((res) => res.documents),
);

const getDocumentUrl = (doc: Document) => `/documents/${doc.id}/${doc.slug}`;

// « il y a X min/h/j » sur date_created (= date d'ajout au site).
// `now` est capturé au rendu serveur et transmis au client via useState :
// SSR et hydratation calculent le même libellé (pas de mismatch).
const now = useState('latest-documents-now', () => Date.now());
const timeAgo = (dateStr: string): string => {
  const diffMin = Math.floor((now.value - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 60) return 'il y a moins d’une heure';
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'hier';
  if (diffD < 7) return `il y a ${diffD} jours`;
  return ''; // au-delà d'une semaine : date absolue plus parlante
};
</script>

<template>
  <section class="my-4" aria-labelledby="latest-documents-heading">
    <!-- Variante 'left' = titre de section dans une page (ex. /documents) : plus petit que le H1.
         Variante 'center' (défaut) = section de l'accueil. -->
    <h2
      id="latest-documents-heading"
      class="mb-4 font-semibold text-gray-800 dark:text-white"
      :class="props.titleAlign === 'left' ? 'text-left text-lg' : 'text-center text-xl'"
    >
      Derniers documents publiés
    </h2>

    <!-- Loading state -->
    <div
      v-if="pending"
      class="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-4 pt-1 md:grid md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
      :class="gridClass"
      aria-busy="true"
      aria-label="Chargement des documents"
    >
      <div
        v-for="n in props.limit"
        :key="n"
        class="w-40 flex-shrink-0 snap-start rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800 sm:w-56 md:w-auto md:flex-shrink"
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
      v-else-if="error"
      title="Erreur"
      description="Une erreur est survenue lors du chargement des documents."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Documents -->
    <div v-else-if="documents && documents.length > 0">
      <div
        class="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-4 pt-1 md:grid md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
        :class="gridClass"
        role="list"
      >
        <UCard
          v-for="doc in documents"
          :key="doc.id"
          role="listitem"
          :ui="{ body: { padding: 'p-3 sm:p-4' } }"
          class="w-40 flex-shrink-0 snap-start transition-transform active:scale-[0.98] sm:w-56 md:w-auto md:flex-shrink"
        >
          <NuxtLink
            :to="getDocumentUrl(doc)"
            class="flex flex-col"
            :aria-label="`Voir le document : ${doc.title}`"
          >
            <!-- Image -->
            <div class="mb-3 w-full">
              <CmsImage
                v-if="doc.cover_image"
                :src="doc.cover_image"
                :quality="25"
                :alt="`Aperçu ${doc.title}`"
                class="aspect-[4/3] w-full rounded-md object-cover"
                loading="lazy"
              />
              <img
                v-else-if="doc.type === 'official_journal'"
                src="/images/default-journal-officiel.webp"
                :alt="`Aperçu ${doc.title}`"
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
            <h3 class="line-clamp-2 text-sm font-medium leading-snug text-gray-900 dark:text-white">
              {{ doc.title }}
            </h3>

            <!-- Date d'ajout (relative si récente ; datetime ISO pour les machines) -->
            <time
              v-if="doc.date_created"
              :datetime="doc.date_created"
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ timeAgo(doc.date_created) || $dateformat(doc.date_created) }}
            </time>
          </NuxtLink>
        </UCard>
      </div>

      <!-- CTA -->
      <div v-if="!props.hideCta" class="mt-6 text-center">
        <UButton
          to="/documents/public"
          color="gray"
          variant="solid"
          size="md"
          trailing-icon="i-heroicons-arrow-right"
          class="rounded-full border-gray-200 bg-white font-medium"
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
