<script setup lang="ts">
import type { Document } from '~~/types/document';

interface Props {
  document: Document;
  /** Mode d'affichage du thumbnail */
  thumbnailMode?: 'cms-image' | 'static-image' | 'logo';
  /** Image statique (pour journal officiel) */
  staticImage?: string;
  /** Fonction pour obtenir le logo (pour rapports audit) */
  getLogo?: (institution: string) => string;
  /** Icône de fallback quand pas d'image */
  fallbackIcon?: string;
  /** Afficher la description */
  showDescription?: boolean;
  /** Afficher la date */
  showDate?: boolean;
  /** Afficher l'indicateur de fichier PDF */
  showFileIndicator?: boolean;
  /** Afficher l'institution d'audit */
  showAuditInstitution?: boolean;
}

withDefaults(defineProps<Props>(), {
  thumbnailMode: 'cms-image',
  staticImage: undefined,
  getLogo: undefined,
  fallbackIcon: 'i-heroicons-document-text',
  showDescription: false,
  showDate: true,
  showFileIndicator: false,
  showAuditInstitution: false,
});
</script>

<template>
  <NuxtLink
    :to="`/documents/${document.id}/${document.slug}`"
    class="group flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] dark:bg-gray-800 dark:ring-gray-700 sm:hover:shadow-md"
  >
    <!-- Thumbnail -->
    <div
      :class="[
        'shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700',
        thumbnailMode === 'logo' ? 'flex h-12 w-12 items-center justify-center' : 'h-16 w-20 sm:h-20 sm:w-24',
      ]"
    >
      <!-- Mode logo (rapports audit) -->
      <template v-if="thumbnailMode === 'logo' && getLogo">
        <img
          :src="getLogo(document.audit_institution || '')"
          :alt="document.audit_institution || 'Document'"
          class="h-10 w-10 object-contain"
          loading="lazy"
        />
      </template>

      <!-- Mode image statique (journal officiel) -->
      <template v-else-if="thumbnailMode === 'static-image' && staticImage">
        <img
          :src="staticImage"
          :alt="document.title"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </template>

      <!-- Mode CMS image (défaut) -->
      <template v-else>
        <CmsImage
          v-if="document.cover_image"
          :src="document.cover_image"
          :alt="document.title"
          :quality="25"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div v-else class="flex h-full w-full items-center justify-center">
          <UIcon :name="fallbackIcon" class="h-6 w-6 text-gray-300 dark:text-gray-600" />
        </div>
      </template>
    </div>

    <!-- Content -->
    <div class="flex min-w-0 flex-1 flex-col justify-center">
      <h2
        class="group-hover:text-primary-500 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors dark:text-white"
      >
        {{ document.title }}
      </h2>

      <!-- Description -->
      <p
        v-if="showDescription && document.description"
        class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400"
      >
        {{ document.description }}
      </p>

      <!-- Audit institution -->
      <span
        v-if="showAuditInstitution && document.audit_institution"
        class="mt-1 text-xs text-gray-500 dark:text-gray-400"
      >
        {{ document.audit_institution }}
      </span>

      <!-- Date and file indicator -->
      <div
        v-if="showDate || showFileIndicator"
        class="mt-2 flex items-center gap-3 text-xs text-gray-400"
      >
        <span v-if="showDate && document.publish_date" class="flex items-center gap-1">
          <UIcon name="i-heroicons-calendar" class="h-3.5 w-3.5" />
          {{ $dateMonthYearformat(document.publish_date) }}
        </span>
        <span v-if="showFileIndicator && document.file" class="flex items-center gap-1">
          <UIcon name="i-heroicons-document" class="h-3.5 w-3.5" />
          PDF
        </span>
      </div>
    </div>

    <!-- Arrow -->
    <UIcon
      name="i-heroicons-chevron-right"
      class="h-5 w-5 shrink-0 self-center text-gray-300 dark:text-gray-600"
    />
  </NuxtLink>
</template>
