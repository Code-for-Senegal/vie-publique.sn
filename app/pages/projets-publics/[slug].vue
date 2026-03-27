<script setup lang="ts">
// ─── Feature flag guard ──────────────────────────────────────────────
const { isFeatureEnabled } = useFeatureFlags();
if (!isFeatureEnabled('menu_projets_publics')) {
  throw showError({ statusCode: 404, statusMessage: 'Page introuvable' });
}

// ─── Route params ────────────────────────────────────────────────────
const route = useRoute();
const slug = route.params.slug as string;

// ─── Data ────────────────────────────────────────────────────────────
const { project, budgetYears, loading, error } = usePublicProjectDetail(slug);

// ─── SEO dynamique ───────────────────────────────────────────────────
useSeoMeta({
  title: computed(() =>
    project.value ? `${project.value.title} - Projets Publics Sénégal` : 'Projet Public',
  ),
  description: computed(() => project.value?.summary || 'Fiche détail du projet public'),
  ogTitle: computed(() => project.value?.title || 'Projet Public'),
  ogDescription: computed(() => project.value?.summary || ''),
});
</script>

<template>
  <div class="min-h-screen pb-16">
    <!-- Hero Header -->
    <div class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="container mx-auto px-4 py-6 sm:py-8">
        <AppBreadcrumb
          :items="[
            { label: 'Accueil', to: '/' },
            { label: 'Projets Publics', to: '/projets-publics' },
            { label: project?.shortTitle || project?.title || 'Projet' },
          ]"
          class="mb-4"
        />
      </div>
    </div>

    <!-- Main content -->
    <div class="container mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="relative h-12 w-12">
          <div class="absolute inset-0 animate-ping rounded-full bg-cyan-200 opacity-75"></div>
          <div class="relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
            <UIcon
              name="i-heroicons-clipboard-document-list"
              class="h-6 w-6 animate-pulse text-cyan-600"
            />
          </div>
        </div>
        <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Chargement du projet...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="mx-auto max-w-md py-12">
        <div
          class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20"
        >
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
          >
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-6 w-6 text-red-600 dark:text-red-400"
            />
          </div>
          <h3 class="text-lg font-semibold text-red-900 dark:text-red-200">Projet introuvable</h3>
          <p class="mt-2 text-sm text-red-700 dark:text-red-300">
            Le projet demandé n'existe pas ou n'est pas disponible.
          </p>
          <NuxtLink
            to="/projets-publics"
            class="bg-primary-600 hover:bg-primary-700 mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            Retour aux projets
          </NuxtLink>
        </div>
      </div>

      <!-- Content -->
      <div v-else-if="project" class="space-y-6">
        <!-- Header + infos clés + budget total -->
        <PublicProjectsDetailHeader :project="project" />

        <!-- Description HTML -->
        <div
          v-if="project.description"
          class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 class="mb-3 text-lg font-bold text-gray-900 dark:text-white">Description</h3>
          <div class="prose prose-sm max-w-none dark:prose-invert" v-html="project.description" />
        </div>

        <!-- Budgets annuels -->
        <PublicProjectsDetailBudgetBlock :budget-years="budgetYears" />

        <!-- Documents liés -->
        <PublicProjectsDetailDocuments
          :document-primary="project.documentPrimary"
          :documents="project.documents"
        />

        <!-- Métadonnées / Source -->
        <div
          v-if="project.sourceLabel || project.titleSourceRaw"
          class="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Source des données
          </h4>
          <p v-if="project.sourceLabel" class="text-sm text-gray-600 dark:text-gray-400">
            {{ project.sourceLabel }}
          </p>
          <p v-if="project.titleSourceRaw" class="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Référence : {{ project.titleSourceRaw }}
          </p>
          <div
            v-if="project.yearLabel || project.versionLabel"
            class="mt-2 flex gap-3 text-xs text-gray-500 dark:text-gray-500"
          >
            <span v-if="project.yearLabel">Année : {{ project.yearLabel }}</span>
            <span v-if="project.versionLabel">Version : {{ project.versionLabel }}</span>
          </div>
        </div>

        <!-- Bouton retour -->
        <div class="pt-4">
          <NuxtLink
            to="/projets-publics"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
            Retour aux projets
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
