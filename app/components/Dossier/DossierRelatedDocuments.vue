<template>
  <div class="space-y-3">
    <DocumentsDocumentListItem
      v-for="doc in documents"
      :key="doc.id"
      :document="doc as any"
      thumbnail-mode="cms-image"
      :show-date="true"
    />
  </div>
</template>

<script setup lang="ts">
import type { DossierLinkedDocument } from '~~/types/dossier';

/**
 * Réutilise le composant document habituel du site (`DocumentsDocumentListItem`)
 * pour un rendu cohérent avec les pages /documents.
 */
defineProps<{ documents: DossierLinkedDocument[] }>();
</script>
