<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <NuxtLink to="/" class="hover:text-primary">Accueil</NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
      <NuxtLink to="/budget" class="hover:text-primary">Budget</NuxtLink>
      <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
      <span class="font-medium text-gray-900 dark:text-white">Glossaire</span>
    </nav>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Glossaire Budgétaire</h1>
      <p class="text-gray-600 dark:text-gray-400">
        Découvrez les termes et définitions essentiels pour comprendre le budget de l'État du
        Sénégal
      </p>
    </div>

    <!-- Filtres -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
      <!-- Recherche -->
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher un terme..."
        size="lg"
        class="flex-1 sm:max-w-md"
      />

      <!-- Filtre par catégorie -->
      <USelect v-model="selectedCategory" :options="categories" size="lg" class="w-full sm:w-64">
        <template #leading>
          <UIcon name="i-heroicons-funnel" class="h-4 w-4" />
        </template>
      </USelect>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">
        Erreur lors du chargement du glossaire. Veuillez réessayer.
      </p>
    </div>

    <!-- Glossary content -->
    <div v-else class="mx-auto max-w-4xl">
      <!-- Stats -->
      <div class="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {{ filteredTerms.length }} terme{{ filteredTerms.length > 1 ? 's' : '' }} trouvé{{
          filteredTerms.length > 1 ? 's' : ''
        }}
      </div>

      <!-- No results -->
      <div
        v-if="filteredTerms.length === 0"
        class="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800"
      >
        <UIcon name="i-heroicons-magnifying-glass" class="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p class="text-gray-600 dark:text-gray-400">Aucun terme trouvé</p>
      </div>

      <!-- Glossary accordion -->
      <UAccordion
        v-else
        :items="accordionItems"
        :ui="{
          wrapper: 'space-y-2',
          item: {
            base: 'rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden',
          },
        }"
      >
        <template #default="{ item, open }">
          <UButton
            color="gray"
            variant="ghost"
            class="w-full justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800"
            :ui="{ rounded: 'rounded-none' }"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-information-circle" class="text-primary h-5 w-5" />
              <span class="text-left font-semibold">{{ item.label }}</span>
            </div>
            <UIcon
              name="i-heroicons-chevron-down"
              class="h-5 w-5 transition-transform"
              :class="{ 'rotate-180': open }"
            />
          </UButton>
        </template>

        <template #item="{ item }">
          <div class="bg-gray-50 px-4 py-4 dark:bg-gray-800">
            <p class="text-gray-700 dark:text-gray-300">{{ item.content }}</p>
          </div>
        </template>
      </UAccordion>

      <!-- Back to budget button -->
      <div class="mt-12 text-center">
        <UButton
          to="/budget"
          icon="i-heroicons-arrow-left"
          color="gray"
          variant="outline"
          size="lg"
        >
          Retour au budget
        </UButton>
      </div>
    </div>
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
