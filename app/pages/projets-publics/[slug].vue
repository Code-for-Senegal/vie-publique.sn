<script setup lang="ts">
// ─── Feature flag guard ──────────────────────────────────────────────
// const { isFeatureEnabled } = useFeatureFlags();
// if (!isFeatureEnabled('menu_projets_publics')) {
//   throw showError({ statusCode: 404, statusMessage: 'Page introuvable' });
// }

// ─── Route params ────────────────────────────────────────────────────
const route = useRoute();
const slug = route.params.slug as string;

// ─── Data ────────────────────────────────────────────────────────────
const { project, budgetYears, loading, error } = usePublicProjectDetail(slug);

// ─── External links ──────────────────────────────────────────────────
const externalLinks = computed(() => {
  if (!project.value) return [];
  const links: { label: string; url: string; icon: string }[] = [];
  if (project.value.linkWebsite)
    links.push({ label: 'Site web', url: project.value.linkWebsite, icon: 'i-heroicons-globe-alt' });
  if (project.value.linkFacebook)
    links.push({ label: 'Facebook', url: project.value.linkFacebook, icon: 'i-heroicons-link' });
  if (project.value.linkLinkedin)
    links.push({ label: 'LinkedIn', url: project.value.linkLinkedin, icon: 'i-heroicons-link' });
  if (project.value.linkTwitter)
    links.push({ label: 'Twitter / X', url: project.value.linkTwitter, icon: 'i-heroicons-link' });
  return links;
});

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
    <div class="border-b border-gray-200 bg-white dark:border-[#38444D] dark:bg-transparent">
      <div class="container mx-auto px-4 py-2 sm:py-4">
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
          <h3 class="mb-3 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <UIcon name="i-heroicons-document-magnifying-glass" class="h-5 w-5 text-gray-400" />
            Description
          </h3>
          <div class="prose prose-sm max-w-none dark:prose-invert" v-html="project.description" />
        </div>

        <!-- Budgets annuels -->
        <PublicProjectsDetailBudgetBlock :budget-years="budgetYears" />

        <!-- Liens externes -->
        <div
          v-if="externalLinks.length > 0"
          class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-4 w-4 text-gray-400" />
            En savoir plus, les liens du projet
          </h3>
          <div class="flex flex-wrap gap-2">
            <a
              v-for="link in externalLinks"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <UIcon :name="link.icon" class="h-4 w-4 text-gray-400" />
              {{ link.label }}
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="h-3 w-3 text-gray-400" />
            </a>
          </div>
        </div>

        <!-- Documents liés -->
        <PublicProjectsDetailDocuments
          :document-primary="project.documentPrimary"
          :documents="project.documents"
        />

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
