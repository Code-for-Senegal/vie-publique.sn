<template>
  <div class="container mx-auto min-h-screen px-4 py-8 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'Budget' }
      ]"
    />

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
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              Dashboard Budget 2026
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Projet de Loi de Finances</p>
          </div>
        </div>

        <!-- 2 colonnes : Indicateurs + Texte (sur desktop) / 4 cartes en 2x2 (sur mobile) -->
        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-[2fr,1fr] md:gap-6">
          <!-- Colonne gauche : 3 cartes sur desktop, 4 cartes en 2x2 sur mobile -->
          <div class="col-span-2 grid grid-cols-2 gap-4 md:col-span-1 md:grid-cols-3">
            <!-- Dépenses -->
            <div
              class="rounded-lg bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 p-4 shadow-md dark:from-orange-900/30 dark:via-orange-800/25 dark:to-orange-900/20"
            >
              <h3 class="mb-3 text-sm font-semibold text-orange-800 dark:text-orange-300">
                Dépenses
              </h3>
              <div class="mb-2 flex flex-wrap items-baseline gap-2">
                <span
                  class="text-2xl font-bold tracking-tight text-orange-900 sm:text-3xl dark:text-orange-200"
                  >7 434</span
                >
                <UBadge color="orange" variant="solid" size="xs">+13,0%</UBadge>
              </div>
              <div class="text-xs text-orange-700 dark:text-orange-400">Milliards FCFA</div>
            </div>

            <!-- Recettes -->
            <div
              class="rounded-lg bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 p-4 shadow-md dark:from-emerald-900/30 dark:via-green-800/25 dark:to-teal-900/20"
            >
              <h3 class="mb-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Recettes
              </h3>
              <div class="mb-2 flex flex-wrap items-baseline gap-2">
                <span
                  class="text-2xl font-bold tracking-tight text-emerald-900 sm:text-3xl dark:text-emerald-200"
                  >6 189</span
                >
                <UBadge color="green" variant="solid" size="xs">+26,7%</UBadge>
              </div>
              <div class="text-xs text-emerald-700 dark:text-emerald-400">Milliards FCFA</div>
            </div>

            <!-- Déficit -->
            <div
              class="rounded-lg bg-gradient-to-br from-red-50 via-rose-100 to-pink-200 p-4 shadow-md dark:from-red-900/30 dark:via-rose-800/25 dark:to-pink-900/20"
            >
              <h3 class="mb-3 text-sm font-semibold text-red-800 dark:text-red-300">Déficit</h3>
              <div class="mb-2 flex flex-wrap items-baseline gap-2">
                <span
                  class="text-2xl font-bold tracking-tight text-red-900 sm:text-3xl dark:text-red-200"
                  >1 245</span
                >
                <UBadge color="red" variant="solid" size="xs">-26,6%</UBadge>
              </div>
              <div class="text-xs text-red-700 dark:text-red-400">Milliards FCFA</div>
            </div>

            <!-- CTA Card (visible uniquement sur mobile) -->
            <NuxtLink
              to="/budget-senegal/dashboard"
              class="group flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 p-4 shadow-md transition hover:shadow-lg md:hidden dark:from-blue-900/30 dark:via-blue-800/25 dark:to-indigo-900/20"
            >
              <UIcon
                name="i-heroicons-chart-bar-square"
                class="mb-2 h-8 w-8 text-blue-600 transition group-hover:scale-110 dark:text-blue-400"
              />
              <span class="text-center text-xs font-semibold text-blue-800 dark:text-blue-300">
                Tableau de bord complet
              </span>
              <UIcon
                name="i-heroicons-arrow-right"
                class="mt-1 h-4 w-4 text-blue-600 transition group-hover:translate-x-1 dark:text-blue-400"
              />
            </NuxtLink>
          </div>

          <!-- Colonne droite : Texte intro (visible uniquement sur desktop) -->
          <div class="hidden md:block">
            <p class="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              Le Projet de Loi de Finances 2026 présente les prévisions de ressources et de dépenses
              de l'État pour l'année. Il sert de cadre d'exécution pour l'action publique et
              s'appuie sur des hypothèses macroéconomiques définies pour l'économie nationale.
            </p>
          </div>
        </div>

        <!-- CTA -->
        <template #footer>
          <div class="text-center">
            <NuxtLink
              to="/budget-senegal/dashboard"
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
        <NuxtLink to="/budget-senegal/ministeres">
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
        <NuxtLink to="/budget-senegal/institutions">
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
      <NuxtLink to="/budget-senegal/glossaire">
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
