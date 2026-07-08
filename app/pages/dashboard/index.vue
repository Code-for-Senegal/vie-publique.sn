<script setup lang="ts">
// ─── SEO : noindex (page test) ─────────────────────────────────────
useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
});

useSeoMeta({
  title: 'Dashboards - Vie Publique Sénégal',
  description: 'Liste des tableaux de bord disponibles sur Vie Publique Sénégal.',
  robots: 'noindex, nofollow, noarchive',
});

const dashboards = [
      {
    title: 'Dashboard Budget',
      description: 'Tableau de bord des Lois de finances au Sénégal : budgets, dépenses et répartition par secteur.',
      to: '/budget-senegal',
  },
    {
    title: 'Dashboard Projets Publics',
    description: 'Tableau de bord des projets publics et investissements (PIP, PRES).',
    to: '/projets-publics-senegal',
  },
  {
    title: 'Dashboard PRES',
    description: 'Projets et Réformes du Sénégal (PRES). Suivi des AE et CP par année.',
    to: '/projets-publics-senegal/pres',
  },
  {
    title: 'Dashboard PIP',
    description: 'Programme d\'Investissements Publics (PIP). Budget total par projet.',
    to: '/projets-publics-senegal/pip',
  },
    {
    title: 'Dashboard RAC 2025',
    description:
      'Suivi de la mise en œuvre de la politique économique et sociale en 2024, indicateurs sectoriels, pôles territoriaux et cadre SND 2025-2029.',
    to: '/dashboard/rac-2025-revue-annuelle-conjointe-senegal',
  },
  {
    title: 'Dashboard Corruption',
    description: 'Suivi des indicateurs de corruption et de gouvernance au Sénégal.',
    to: '/dashboard/corruption',
  },
    {
    title: 'Dashboard Test Économique',
    description:
      'Indicateurs économiques du Sénégal : PIB, croissance, chômage et données régionales.',
    to: '/dashboard/economie',
  },
  {
    title: 'Dashboard Test Conseil des Ministres',
    description: 'Décisions et nominations issues du Conseil des Ministres.',
    to: '/dashboard/conseil-ministre',
  },

];
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">Tests Dashboards / Observatoires</h1>
<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-500 sm:text-sm">
              Tableau de bord citoyen des politiques publiques
            </p>
    <ul class="space-y-4">
      <li v-for="item in dashboards" :key="item.to">
        <NuxtLink
          :to="item.to"
          class="block rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          <h2 class="text-primary text-lg font-semibold">{{ item.title }}</h2>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ item.description }}</p>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
