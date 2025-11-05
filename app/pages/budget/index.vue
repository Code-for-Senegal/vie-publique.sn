<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Hero Section (sobre, sans CTA) -->
    <section class="mb-8 text-center">
      <div class="mx-auto max-w-4xl">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 md:text-5xl dark:text-white">
          Budget du Sénégal
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Comprendre les finances publiques du Sénégal : budgets, documents officiels et analyses
        </p>
      </div>
    </section>

    <!-- Dashboard Card (star, 1 ligne complète) -->
    <section class="mb-8">
      <UCard
        class="border-primary/20 dark:via-primary/10 dark:to-primary/20 overflow-hidden bg-white shadow-xl transition dark:bg-gradient-to-br dark:from-gray-800"
        :ui="{ body: { padding: 'p-2 sm:p-4' } }"
      >
        <!-- Header -->
        <div class="mb-6 flex items-center gap-3">
          <div class="rounded-lg bg-gray-500/10 p-3">
            <UIcon name="i-heroicons-building-library" class="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
              Aperçu Budgétaire 2026
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Projet de Loi de Finances</p>
          </div>
        </div>

        <!-- Barres proportionnelles -->
        <div class="mb-6 space-y-4">
          <!-- Barre Dépenses (100% largeur) -->
          <div>
            <!-- Label au-dessus -->
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Dépenses</span>
            </div>
            <!-- Barre pleine avec gradient -->
            <div
              class="flex items-center justify-between rounded-lg bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-2 py-2 shadow-lg sm:px-3"
            >
              <span class="text-xl font-bold text-white sm:text-xl"
                >7 434 Mrd <span color="white" class="mt-1 text-xs">+13,0%</span></span
              >
            </div>
          </div>

          <!-- Barres Recettes + Déficit (proportionnelles) -->
          <div class="flex gap-2">
            <!-- Recettes (83% de 7434 = 6189) -->
            <div class="flex-[67]">
              <!-- Label au-dessus -->
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Recettes</span>
              </div>
              <!-- Barre avec gradient vert -->
              <div
                class="flex items-center justify-between rounded-lg bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 px-2 py-2 shadow-lg sm:px-3"
              >
                <span class="text-lg font-bold text-white sm:text-xl"
                  >6 189 Mrd <span color="white" class="mt-1 text-xs">+26,7%</span></span
                >
              </div>
            </div>

            <!-- Déficit (17% de 7434 = 1245) -->
            <div class="flex-[33]">
              <!-- Label au-dessus -->
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Déficit</span>
              </div>
              <!-- Barre avec gradient rouge -->
              <div
                class="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 px-2 py-2 shadow-lg sm:px-3"
              >
                <span class="text-lg font-bold text-white sm:text-xl"
                  >1 245 <span color="white" class="mt-1 text-xs">-26,6%</span></span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <template #footer>
          <div class="text-center">
            <NuxtLink
              to="/budget-senegal"
              class="inline-flex items-center gap-2 font-semibold text-gray-800 transition-all hover:gap-3 hover:text-blue-800 dark:text-gray-300 dark:hover:text-blue-700"
            >
              <span>Voir le tableau de bord complet</span>
              <UIcon name="i-heroicons-arrow-right" size="xs" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </template>
      </UCard>
    </section>

    <!-- Section Ressources (3 cards) -->
    <section class="mb-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <!-- Ministères -->
        <NuxtLink to="/budget/ministeres">
          <UCard
            class="border-primary/20 hover:border-primary/30 dark:via-primary/10 dark:to-primary/20 border-1 h-full cursor-pointer overflow-hidden bg-white transition hover:shadow-lg dark:bg-gradient-to-br dark:from-gray-800"
            :ui="{ body: { padding: 'p-2 sm:p-4' } }"
          >
            <div class="flex items-start gap-4">
              <div class="rounded-lg bg-blue-500/10 p-3">
                <UIcon name="i-heroicons-building-office" class="h-6 w-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Ministères</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Budgets et programmes des ministères
                </p>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <!-- Institutions -->
        <NuxtLink to="/budget/institutions">
          <UCard
            class="border-primary/20 hover:border-primary/30 dark:via-primary/10 dark:to-primary/20 border-1 h-full cursor-pointer overflow-hidden bg-white transition hover:shadow-lg dark:bg-gradient-to-br dark:from-gray-800"
            :ui="{ body: { padding: 'p-2 sm:p-4' } }"
          >
            <div class="flex items-start gap-4">
              <div class="rounded-lg bg-purple-500/10 p-3">
                <UIcon name="i-heroicons-building-library" class="h-6 w-6 text-purple-600" />
              </div>
              <div class="flex-1">
                <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Institutions</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Budgets Assemblée, Présidence, etc.
                </p>
              </div>
            </div>
          </UCard>
        </NuxtLink>

        <!-- Documents -->
        <NuxtLink to="/documents/budget">
          <UCard
            class="border-primary/20 hover:border-primary/30 dark:via-primary/10 dark:to-primary/20 border-1 h-full cursor-pointer overflow-hidden bg-white transition hover:shadow-lg dark:bg-gradient-to-br dark:from-gray-800"
            :ui="{ body: { padding: 'p-2 sm:p-4' } }"
          >
            <div class="flex items-start gap-4">
              <div class="rounded-lg bg-orange-500/10 p-3">
                <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-orange-600" />
              </div>
              <div class="flex-1">
                <h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Documents</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Loi de finances et documents officiels
                </p>
              </div>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <!-- Glossaire (seul sur une ligne) -->
    <section class="mb-6">
      <NuxtLink to="/budget/glossaire">
        <UCard
          class="border-primary/20 hover:border-primary/30 dark:via-primary/10 dark:to-primary/20 border-1 cursor-pointer overflow-hidden bg-white transition hover:shadow-lg dark:bg-gradient-to-br dark:from-gray-800"
          :ui="{ body: { padding: 'p-2 sm:p-4' } }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="rounded-lg bg-green-500/10 p-3">
                <UIcon name="i-heroicons-book-open" class="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">Glossaire budgétaire</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Termes et concepts essentiels du budget
                </p>
              </div>
            </div>
            <UIcon name="i-heroicons-arrow-right" class="hidden h-6 w-6 text-gray-400 md:block" />
          </div>
        </UCard>
      </NuxtLink>
    </section>

    <!-- Section Comprendre le Budget (articles) -->
    <section class="mb-12">
      <UCard
        class="border-primary/20 hover:border-primary/30 dark:via-primary/10 dark:to-primary/20 border-1 overflow-hidden bg-white shadow-lg transition hover:shadow-xl dark:bg-gradient-to-br dark:from-gray-800"
        :ui="{ body: { padding: 'p-4 sm:p-6' } }"
      >
        <div class="mb-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Comprendre le Budget</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Articles et analyses pour mieux comprendre les finances publiques
          </p>
        </div>

        <BudgetArticles />
      </UCard>
    </section>
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

// Fetch budget data pour le Dashboard Card
const { data: budgetData } = await useFetch('/api/budget/compare', {
  query: {
    year: new Date().getFullYear(),
  },
});
</script>
