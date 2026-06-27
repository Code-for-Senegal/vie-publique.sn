<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-900">
    <!-- Breadcrumb -->
    <div class="container mx-auto px-4 pt-4">
      <AppBreadcrumb :items="[{ label: 'Budget' }]" />
    </div>

    <!-- Header mobile-first -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:relative md:border-0 md:bg-transparent md:backdrop-blur-none dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3 md:py-6">
        <h1 class="text-lg font-bold text-gray-900 sm:text-xl dark:text-white">
          Budget du Sénégal
        </h1>
        <p class="mt-0.5 text-xs text-gray-500 md:mt-1 md:text-sm dark:text-gray-400">
          Finances publiques et documents officiels
        </p>
      </div>
    </header>

    <main class="container mx-auto px-4 py-4 md:py-6">
      <!-- Dashboard Hero Card -->
      <NuxtLink
        to="/budget-senegal/dashboard"
        class="group mb-6 block rounded-2xl bg-white p-4 ring-1 ring-gray-200 transition-all active:scale-[0.99] md:p-6 md:hover:ring-emerald-300 md:hover:shadow-lg dark:bg-gray-800 dark:ring-gray-700"
      >
        <!-- Header -->
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <UIcon name="i-heroicons-chart-bar" class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 class="text-sm font-semibold text-gray-900 md:text-base dark:text-white">
                Tableau de bord 2026
              </h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">Projet de Loi de Finances</p>
            </div>
          </div>
          <UIcon
            name="i-heroicons-arrow-right"
            class="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-500"
          />
        </div>

<!-- Description -->
        <p class="mb-4 text-xs leading-relaxed text-gray-600 md:text-sm dark:text-gray-400">
          Le Projet de Loi de Finances 2026 présente les prévisions de ressources et de dépenses de l'État pour l'année. Il sert de cadre d'exécution pour l'action publique.
        </p>

        <!-- KPIs Grid -->
        <div class="grid grid-cols-3 gap-2 md:gap-4">
          <!-- Dépenses -->
          <div class="rounded-xl bg-orange-50 p-3 dark:bg-orange-900/20">
            <p class="text-[10px] font-medium text-orange-600 md:text-xs dark:text-orange-400">Dépenses</p>
            <p class="mt-1 text-lg font-bold text-orange-700 md:text-2xl dark:text-orange-300">7 434</p>
            <div class="mt-1 flex items-center gap-1">
              <span class="text-[10px] text-orange-500 md:text-xs">Mrd FCFA</span>
              <span class="rounded bg-orange-200 px-1 py-0.5 text-[9px] font-medium text-orange-700 md:text-[10px] dark:bg-orange-800 dark:text-orange-200">+13%</span>
            </div>
          </div>

          <!-- Recettes -->
          <div class="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
            <p class="text-[10px] font-medium text-emerald-600 md:text-xs dark:text-emerald-400">Recettes</p>
            <p class="mt-1 text-lg font-bold text-emerald-700 md:text-2xl dark:text-emerald-300">6 189</p>
            <div class="mt-1 flex items-center gap-1">
              <span class="text-[10px] text-emerald-500 md:text-xs">Mrd FCFA</span>
              <span class="rounded bg-emerald-200 px-1 py-0.5 text-[9px] font-medium text-emerald-700 md:text-[10px] dark:bg-emerald-800 dark:text-emerald-200">+27%</span>
            </div>
          </div>

          <!-- Déficit -->
          <div class="rounded-xl bg-red-50 p-3 dark:bg-red-900/20">
            <p class="text-[10px] font-medium text-red-600 md:text-xs dark:text-red-400">Déficit</p>
            <p class="mt-1 text-lg font-bold text-red-700 md:text-2xl dark:text-red-300">1 245</p>
            <div class="mt-1 flex items-center gap-1">
              <span class="text-[10px] text-red-500 md:text-xs">Mrd FCFA</span>
              <span class="rounded bg-red-200 px-1 py-0.5 text-[9px] font-medium text-red-700 md:text-[10px] dark:bg-red-800 dark:text-red-200">-27%</span>
            </div>
          </div>
        </div>
      </NuxtLink>

      <!-- Navigation Links - Mobile: vertical list, Desktop: grid -->
      <div class="space-y-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-4">
        <!-- Ministères -->
        <NuxtLink
          to="/budget-senegal/ministeres"
          class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.98] md:flex-col md:items-start md:gap-0 md:p-4 md:hover:ring-blue-200 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 md:mb-3 dark:bg-blue-900/30">
            <UIcon name="i-heroicons-building-office" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Ministères</h3>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              Budgets et programmes
            </p>
          </div>
          <UIcon
            name="i-heroicons-chevron-right"
            class="h-4 w-4 shrink-0 text-gray-300 md:hidden dark:text-gray-600"
          />
        </NuxtLink>

        <!-- Institutions -->
        <NuxtLink
          to="/budget-senegal/institutions"
          class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.98] md:flex-col md:items-start md:gap-0 md:p-4 md:hover:ring-purple-200 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 md:mb-3 dark:bg-purple-900/30">
            <UIcon name="i-heroicons-building-library" class="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Institutions</h3>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              Assemblée, Présidence...
            </p>
          </div>
          <UIcon
            name="i-heroicons-chevron-right"
            class="h-4 w-4 shrink-0 text-gray-300 md:hidden dark:text-gray-600"
          />
        </NuxtLink>

        <!-- Documents -->
        <NuxtLink
          to="/documents/budget"
          class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.98] md:flex-col md:items-start md:gap-0 md:p-4 md:hover:ring-orange-200 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 md:mb-3 dark:bg-orange-900/30">
            <UIcon name="i-heroicons-document-text" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Documents</h3>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              Loi de finances
            </p>
          </div>
          <UIcon
            name="i-heroicons-chevron-right"
            class="h-4 w-4 shrink-0 text-gray-300 md:hidden dark:text-gray-600"
          />
        </NuxtLink>

        <!-- Glossaire -->
        <NuxtLink
          to="/budget-senegal/glossaire"
          class="group flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-gray-100 transition-all active:scale-[0.98] md:flex-col md:items-start md:gap-0 md:p-4 md:hover:ring-teal-200 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700"
        >
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 md:mb-3 dark:bg-teal-900/30">
            <UIcon name="i-heroicons-book-open" class="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Glossaire</h3>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              Termes et concepts
            </p>
          </div>
          <UIcon
            name="i-heroicons-chevron-right"
            class="h-4 w-4 shrink-0 text-gray-300 md:hidden dark:text-gray-600"
          />
        </NuxtLink>
      </div>

      <!-- Section Comprendre le Budget -->
      <section class="mt-6 md:mt-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            Comprendre le Budget
          </h2>
        </div>
        <div class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700">
          <BudgetArticles />
        </div>
      </section>

      <!-- Section Documents Budget -->
      <section class="mt-6 md:mt-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            Documents officiels
          </h2>
        </div>
        <div class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 md:p-6 dark:bg-gray-800 dark:ring-gray-700">
          <BudgetDocuments />
        </div>
      </section>
    </main>

    <ScrollToTopButton />
  </div>
</template>

<script setup lang="ts">
// SEO
const title = "Budget de l'État du Sénégal | Transparence des finances publiques";
const description =
  "Découvrez le budget de l'État du Sénégal : dashboard interactif, budgets par ministère et institution, documents officiels et articles pour comprendre les finances publiques.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});
</script>
