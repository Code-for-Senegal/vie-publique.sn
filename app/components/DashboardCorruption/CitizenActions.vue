<script setup lang="ts">
const actions = [
  {
    title: 'Signaler\nun problème',
    icon: 'i-heroicons-exclamation-triangle',
    to: '/dashboard/corruption/signaler',
    color: 'text-white',
    bg: 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400',
  },
  {
    title: 'Poser\nquestion',
    icon: 'i-heroicons-question-mark-circle',
    to: '/contact',
    color: 'text-white',
    bg: 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400',
  },
  {
    title: "Suivre\nl'indicateur",
    icon: 'i-heroicons-chart-bar',
    to: '/newsletter',
    color: 'text-white',
    bg: 'bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400',
  },
];
</script>

<template>
  <div>
    <h4 class="mb-4 text-base font-bold text-gray-900 dark:text-white">Actions citoyennes</h4>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-3">
      <NuxtLink
        v-for="action in actions"
        :key="action.title"
        :to="action.to"
        class="group flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/20 dark:hover:bg-gray-800"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
          :class="action.bg"
        >
          <UIcon :name="action.icon" class="h-6 w-6" :class="action.color" />
        </div>

        <span class="mt-3 whitespace-pre-line text-xs font-semibold leading-tight text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white">
          {{ action.title }}
        </span>
      </NuxtLink>
    </div>

    <div class="mt-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
      <UIcon name="i-heroicons-information-circle" class="h-5 w-5 shrink-0" />
      <p>Vos signalements sont anonymes et sécurisés sur notre plateforme.</p>
  </div>
  </div>
</template>
