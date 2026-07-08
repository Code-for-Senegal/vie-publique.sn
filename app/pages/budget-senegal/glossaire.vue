<template>
  <div class="min-h-screen bg-gray-50 pb-24 dark:bg-gray-900">
    <!-- Sticky Header Mobile -->
    <header
      class="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/95 md:hidden"
    >
      <div class="flex items-center gap-3 px-4 py-2.5">
        <NuxtLink
          to="/budget-senegal"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors active:bg-gray-200 dark:bg-gray-800 dark:active:bg-gray-700"
        >
          <UIcon name="i-heroicons-arrow-left" class="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </NuxtLink>
        <div class="min-w-0 flex-1">
          <p
            class="text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Budget
          </p>
          <p class="truncate text-base font-semibold text-gray-900 dark:text-white">Glossaire</p>
        </div>
        <span
          class="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          {{ filteredTerms.length }}
        </span>
      </div>
    </header>

    <!-- Desktop Layout -->
    <div class="hidden md:block">
      <!-- Top Bar -->
      <div class="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-transparent">
        <div class="container mx-auto px-6 py-4">
          <div class="flex items-center gap-4">
            <NuxtLink
              to="/budget-senegal"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              <UIcon
                name="i-heroicons-arrow-left"
                class="h-5 w-5 text-gray-700 dark:text-gray-300"
              />
            </NuxtLink>
            <nav class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <NuxtLink to="/budget-senegal" class="hover:text-gray-900 dark:hover:text-white"
                >Budget</NuxtLink
              >
              <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
              <span class="font-medium text-gray-900 dark:text-white">Glossaire</span>
            </nav>
          </div>
        </div>
      </div>

      <!-- Hero Content -->
      <div class="bg-gradient-to-b from-gray-50 to-white dark:bg-transparent dark:bg-none">
        <div class="container mx-auto px-6 py-12">
          <div class="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <!-- Left: Title -->
            <div class="max-w-2xl">
              <div
                class="mb-4 inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800"
              >
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 dark:bg-gray-500"
                >
                  <UIcon name="i-heroicons-book-open" class="h-3.5 w-3.5 text-white" />
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dictionnaire
                </span>
              </div>

              <h1
                class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-4xl"
              >
                Glossaire Budgétaire
              </h1>

              <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">
                Comprendre les termes essentiels du budget de l'État
              </p>
            </div>

            <!-- Right: Stats -->
            <div class="flex gap-4">
              <div
                class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <UIcon
                      name="i-heroicons-bookmark"
                      class="h-6 w-6 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <p class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {{ allTerms.length }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Définitions</p>
                  </div>
                </div>
              </div>
              <div
                class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
                  >
                    <UIcon
                      name="i-heroicons-folder"
                      class="h-6 w-6 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div>
                    <p class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {{ categories.length - 1 }}
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Catégories</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <main class="container mx-auto px-4 py-4 md:px-6 md:py-8">
      <!-- Filtres Card -->
      <div
        class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50 md:rounded-2xl md:p-5"
      >
        <div class="flex flex-col gap-3 md:flex-row md:gap-4">
          <!-- Recherche -->
          <div class="flex-1">
            <label
              class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 md:mb-2 md:text-sm md:text-gray-700 md:dark:text-gray-300"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="h-3.5 w-3.5 md:h-4 md:w-4" />
              Rechercher
            </label>
            <UInput
              v-model="searchQuery"
              icon="i-heroicons-magnifying-glass"
              placeholder="Rechercher..."
              size="md"
              class="w-full"
              :ui="{ icon: { trailing: { pointer: '' } } }"
            >
              <template v-if="searchQuery" #trailing>
                <UButton
                  color="gray"
                  variant="link"
                  icon="i-heroicons-x-mark"
                  :padded="false"
                  size="xs"
                  @click="searchQuery = ''"
                />
              </template>
            </UInput>
          </div>

          <!-- Filtre par catégorie -->
          <div class="md:w-64">
            <label
              class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 md:mb-2 md:text-sm md:text-gray-700 md:dark:text-gray-300"
            >
              <UIcon name="i-heroicons-funnel" class="h-3.5 w-3.5 md:h-4 md:w-4" />
              Catégorie
            </label>
            <USelect v-model="selectedCategory" :options="categories" size="md" class="w-full" />
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="mt-6">
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="text-center">
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-gray-400" />
            </div>
            <p class="font-medium text-gray-900 dark:text-white">Chargement du glossaire</p>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="mx-auto max-w-md py-12 text-center">
          <div
            class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="h-10 w-10 text-red-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white">Erreur de chargement</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">Impossible de charger le glossaire</p>
        </div>

        <!-- Glossary content -->
        <div v-else class="mx-auto max-w-4xl">
          <!-- Stats -->
          <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ filteredTerms.length }} terme{{ filteredTerms.length > 1 ? 's' : '' }}
              <span v-if="selectedCategory !== 'Toutes'" class="text-gray-600 dark:text-gray-300">
                · {{ selectedCategory }}</span
              >
            </p>
          </div>

          <!-- No results -->
          <div
            v-if="filteredTerms.length === 0"
            class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50"
          >
            <div
              class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8 text-gray-400" />
            </div>
            <p class="text-lg font-medium text-gray-900 dark:text-white">Aucun terme trouvé</p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Essayez avec d'autres mots-clés
            </p>
            <UButton
              v-if="searchQuery"
              color="gray"
              variant="soft"
              class="mt-4"
              @click="searchQuery = ''"
            >
              Effacer la recherche
            </UButton>
          </div>

          <!-- Glossary accordion -->
          <div v-else class="space-y-3">
            <div
              v-for="item in accordionItems"
              :key="item.label"
              class="group rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50"
            >
              <UAccordion
                :items="[item]"
                :ui="{
                  wrapper: '',
                  item: {
                    base: '',
                  },
                }"
              >
                <template #default="{ item: accordionItem, open }">
                  <button class="flex w-full items-center justify-between p-5 text-left">
                    <div class="flex items-center gap-4">
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800"
                      >
                        <UIcon
                          name="i-heroicons-bookmark"
                          class="h-5 w-5 text-gray-600 dark:text-gray-400"
                        />
                      </div>
                      <span class="font-semibold text-gray-900 dark:text-white">{{
                        accordionItem.label
                      }}</span>
                    </div>
                    <UIcon
                      name="i-heroicons-chevron-down"
                      class="h-5 w-5 text-gray-400 transition-transform"
                      :class="{ 'rotate-180': open }"
                    />
                  </button>
                </template>

                <template #item="{ item: accordionItem }">
                  <div
                    class="border-t border-gray-100 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-800/30"
                  >
                    <p class="leading-relaxed text-gray-700 dark:text-gray-300">
                      {{ accordionItem.content }}
                    </p>
                  </div>
                </template>
              </UAccordion>
            </div>
          </div>

          <!-- Back to budget button -->
          <div class="mt-6">
            <NuxtLink
              to="/budget-senegal"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors active:bg-gray-800 dark:bg-white dark:text-gray-900 dark:active:bg-gray-100 sm:mx-auto sm:w-auto"
            >
              <UIcon name="i-heroicons-arrow-left" class="h-4 w-4" />
              Retour au budget
            </NuxtLink>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// SEO
const title = 'Glossaire Budgétaire | Budget du Sénégal';
const description =
  "Découvrez les termes et définitions essentiels pour comprendre le budget de l'État du Sénégal : déficit budgétaire, crédits de paiement, service de la dette, et bien plus.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});

// Use budget glossary composable
const { allTerms, categories, loading, error } = useBudgetGlossary();

// Recherche et filtre locaux
const searchQuery = ref('');
const selectedCategory = ref('Toutes');

// Termes filtrés par recherche et catégorie
const filteredTerms = computed(() => {
  let filtered = allTerms.value;

  // Filtre par catégorie
  if (selectedCategory.value !== 'Toutes') {
    filtered = filtered.filter((term) => term.category === selectedCategory.value);
  }

  // Filtre par recherche
  const query = searchQuery.value.toLowerCase().trim();
  if (query) {
    filtered = filtered.filter((term) => {
      const inTerm = term.term.toLowerCase().includes(query);
      const inDef = term.definition_short.toLowerCase().includes(query);
      const inDefLong = term.definition_long?.toLowerCase().includes(query);
      const inAliases = term.aliases?.some((alias) => alias.toLowerCase().includes(query));

      return inTerm || inDef || inDefLong || inAliases;
    });
  }

  return filtered;
});

// Format for UAccordion
const accordionItems = computed(() =>
  filteredTerms.value.map((term) => {
    // Prioriser definition_long si disponible, sinon definition_short
    const definition = term.definition_long || term.definition_short;

    // Ajouter les aliases sur une nouvelle ligne si disponibles
    let content = definition;
    if (term.aliases && term.aliases.length > 0) {
      content += `\n\n_Aussi appelé : ${term.aliases.join(', ')}_`;
    }

    return {
      label: term.term,
      content,
      defaultOpen: false,
      category: term.category,
    };
  }),
);
</script>
