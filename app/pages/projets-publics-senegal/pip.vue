<script setup lang="ts">
// ─── SEO ─────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Projets PIP - Programme d\'Investissements Publics du Sénégal',
  description:
    'Programme d\'Investissements Publics (PIP) du Sénégal. Budget total par projet, répartition par secteur et ministère.',
  ogTitle: 'Projets PIP du Sénégal',
  ogDescription: 'Suivi transparent du Programme d\'Investissements Publics : budget total par projet.',
});
</script>

<template>
  <PublicProjectsDashboardLayout
    mode="pip"
    title="Projets PIP"
    description="Programme d'Investissements Publics (PIP). Budget total par projet, répartition par secteur et ministère."
  />
</template>
