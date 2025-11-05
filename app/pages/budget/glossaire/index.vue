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
    <div class="mb-8 text-center">
      <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Glossaire Budgétaire</h1>
      <p class="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
        Découvrez les termes et définitions essentiels pour comprendre le budget de l'État du
        Sénégal
      </p>
    </div>

    <!-- Search -->
    <div class="mb-8">
      <UInput
        v-model="searchQuery"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher un terme..."
        size="xl"
        class="mx-auto max-w-2xl"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/20">
      <p class="text-red-600 dark:text-red-400">
        Erreur lors du chargement du glossaire. Veuillez réessayer.
      </p>
    </div>

    <!-- Glossary content -->
    <div v-else-if="glossaryData" class="mx-auto max-w-4xl">
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
        <p class="text-gray-600 dark:text-gray-400">Aucun terme trouvé pour "{{ searchQuery }}"</p>
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
interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
}

interface GlossaryResponse {
  terms: GlossaryTerm[];
  total: number;
}

// SEO
const title = 'Glossaire Budgétaire | Budget du Sénégal';
const description =
  "Découvrez les termes et définitions essentiels pour comprendre le budget de l'État du Sénégal : administrateur de crédit, annualité budgétaire, autorisation d'engagement, et bien plus.";

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterTitle: title,
  twitterDescription: description,
});

// Fetch glossary data
const {
  data: glossaryData,
  pending,
  error,
} = await useFetch<GlossaryResponse>('/api/budget/glossary');

// Search
const searchQuery = ref('');

// Filter terms based on search
const filteredTerms = computed(() => {
  if (!glossaryData.value?.terms) return [];

  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return glossaryData.value.terms;

  return glossaryData.value.terms.filter(
    (term) =>
      term.term.toLowerCase().includes(query) || term.definition.toLowerCase().includes(query),
  );
});

// Format for UAccordion
const accordionItems = computed(() =>
  filteredTerms.value.map((term) => ({
    label: term.term,
    content: term.definition,
    defaultOpen: false,
  })),
);
</script>
