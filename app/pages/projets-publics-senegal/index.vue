<script setup lang="ts">
// ─── SEO ─────────────────────────────────────────────────────────────
useSeoMeta({
  title: 'Projets Publics du Sénégal - Suivi des investissements',
  description:
    'Tableau de bord des projets publics au Sénégal : PIP, PRES, LFI. Suivi des budgets, répartition par secteur et ministère.',
  ogTitle: 'Projets Publics du Sénégal',
  ogDescription: 'Suivi transparent des projets publics et investissements au Sénégal.',
});
</script>

<template>
  <PublicProjectsDashboardLayout
    mode="global"
    title="Projets Publics du Sénégal"
    description="Suivi transparent des projets publics, des investissements PIP et des projets spécifiques (PRES)."
  />
</template>
