<script setup lang="ts">
import HomeLatestDocuments from '~/components/HomeLatestDocuments.vue';

useHead({
  title: 'Documents officiels du Sénégal',
  meta: [
    {
      name: 'description',
      content:
        "Accédez aux documents officiels du Sénégal: Journal officiel, rapports d'audit, codes généraux et plus encore.",
    },
  ],
});

const documentCategories = [
  {
    title: 'Tous les documents',
    description: 'Explorer tous les documents',
    icon: 'i-heroicons-squares-2x2',
    to: '/documents/public',
    gradient: 'from-purple-500 to-purple-600',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    title: 'Journal Officiel',
    description: 'Textes, Lois, Décrets, Arrêtés',
    icon: 'i-heroicons-newspaper',
    to: '/documents/journal-officiel',
    gradient: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Rapports Publics',
    description: 'Cours des Comptes, OFNAC...',
    icon: 'i-heroicons-document-chart-bar',
    to: '/documents/rapports-audit',
    gradient: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    title: 'Documents Budgétaires',
    description: 'Lois de finances et annexes',
    icon: 'i-heroicons-banknotes',
    to: '/documents/budget',
    gradient: 'from-amber-500 to-amber-600',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    title: 'Documents Stratégie',
    description: 'Stratégies nationales',
    icon: 'i-heroicons-presentation-chart-line',
    to: '/documents/strategies',
    gradient: 'from-rose-500 to-rose-600',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  {
    title: 'Codes Généraux',
    description: 'Constitution, famille, presse...',
    icon: 'i-heroicons-scale',
    to: '/documents/codes',
    gradient: 'from-indigo-500 to-indigo-600',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
];
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb :items="[{ label: 'Documents' }]" />
    </div>

    <!-- Header -->
    <header class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">Documents</h1>
        <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Accédez aux documents officiels du Sénégal
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-4">
      <!-- Categories Grid -->
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
        <NuxtLink
          v-for="cat in documentCategories"
          :key="cat.title"
          :to="cat.to"
          class="group relative flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.97] dark:bg-gray-800 dark:ring-gray-700 sm:p-5 sm:hover:shadow-lg"
        >
          <!-- Icon Container -->
          <div
            :class="[
              cat.iconBg,
              'flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 sm:h-14 sm:w-14',
            ]"
          >
            <UIcon :name="cat.icon" :class="[cat.iconColor, 'h-6 w-6 sm:h-7 sm:w-7']" />
          </div>

          <!-- Text -->
          <h2 class="mt-3 text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
            {{ cat.title }}
          </h2>
          <p class="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
            {{ cat.description }}
          </p>

          <!-- Hover Arrow (desktop) -->
          <div
            class="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 sm:right-3 sm:top-3"
          >
            <UIcon name="i-heroicons-arrow-up-right" class="h-4 w-4 text-gray-400" />
          </div>
        </NuxtLink>
      </div>

      <!-- Latest Documents Section -->
      <section class="mt-8">
        <HomeLatestDocuments />
      </section>
    </main>
  </div>
</template>
