<template>
  <header>
    <!-- Image de couverture -->
    <figure
      v-if="dossier.cover_image"
      class="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
    >
      <CmsImage
        :src="dossier.cover_image"
        :alt="dossier.title"
        class="aspect-[16/9] w-full object-cover sm:aspect-[2/1]"
        loading="eager"
        fetchpriority="high"
      />
    </figure>

    <!-- Texte -->
    <div class="mt-5 sm:mt-6">
      <p
        v-if="dossier.type"
        class="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400"
      >
        {{ dossierTypeLabel(dossier.type) }}
      </p>

      <h1
        class="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
      >
        {{ dossier.title }}
      </h1>

      <p
        v-if="dossier.summary"
        class="mt-3 text-base leading-relaxed text-gray-600 dark:text-gray-300 sm:text-lg"
      >
        {{ dossier.summary }}
      </p>

      <!-- Méta : dates -->
      <div
        class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400"
      >
        <span v-if="dossier.publish_date">Publié le {{ formatDate(dossier.publish_date) }}</span>
        <span v-if="updatedDate" class="text-gray-400 dark:text-gray-500">
          · Mis à jour le {{ formatDate(updatedDate) }}
        </span>
      </div>

      <!-- Tags : discrets, limités -->
      <div v-if="visibleTags.length" class="mt-4 flex flex-wrap gap-1.5">
        <span
          v-for="tag in visibleTags"
          :key="tag"
          class="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { Dossier } from '~~/types/dossier';
import { dossierTypeLabel } from '~/config/dossiers.config';

interface Props {
  dossier: Dossier;
}
const props = defineProps<Props>();

// Max 5 tags affichés (cf. règle design)
const visibleTags = computed(() => (props.dossier.tags || []).slice(0, 5));

const updatedDate = computed(() => {
  if (!props.dossier.date_updated) return '';
  if (props.dossier.publish_date) {
    const pub = new Date(props.dossier.publish_date).toDateString();
    const upd = new Date(props.dossier.date_updated).toDateString();
    if (pub === upd) return '';
  }
  return props.dossier.date_updated;
});

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
</script>
