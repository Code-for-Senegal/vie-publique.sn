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
    title: 'Dashboard Économique',
    description:
      'Indicateurs économiques du Sénégal : PIB, croissance, chômage et données régionales.',
    to: '/dashboard/economie',
  },
  {
    title: 'Dashboard Corruption & Gouvernance',
    description: 'Suivi des indicateurs de corruption et de gouvernance au Sénégal.',
    to: '/dashboard/corruption',
  },
  {
    title: 'Conseil des Ministres',
    description: 'Décisions et nominations issues du Conseil des Ministres.',
    to: '/dashboard/conseil-ministre',
  },
  {
    title: 'Projets Publics',
    description: 'Tableau de bord des projets publics et investissements (PIP, PRES).',
    to: '/projets-publics',
  },
];
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold">Dashboards</h1>

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
