<script setup lang="ts">
// ─── SEO ─────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Projets PRES - Projets et Réformes du Sénégal',
  description:
    'Suivi des Projets et Réformes du Sénégal (PRES). Budget AE/CP par année, répartition par secteur et ministère.',
  ogTitle: 'Projets PRES du Sénégal',
  ogDescription: 'Suivi transparent des projets PRES : autorisations d\'engagement et crédits de paiement.',
});
</script>

<template>
  <PublicProjectsDashboardLayout
    mode="pres"
    title="Projets PRES"
    description="Projets et Réformes du Sénégal (PRES). Suivi des autorisations d'engagement (AE) et crédits de paiement (CP) par année."
  />
</template>
