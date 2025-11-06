<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

// Utilisation du composable
const {
  entity,
  level,
  latestYear,
  loading,
  error,
  currentBudget,
  budgetVariation,
  evolutionChartData,
  formattedPrograms,
  programsTotal,
} = useBudgetEntity(slug);

// SEO
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata();

const title = computed(() =>
  entity.value ? `Budget ${entity.value.name} - Sénégal` : 'Budget - Sénégal',
);

const description = computed(() =>
  entity.value
    ? `Découvrez le budget de ${entity.value.name} : montant total, évolution par année et répartition par programmes.`
    : "Budget de l'État du Sénégal",
);

const url = computed(() => `${siteUrl}/budget-senegal/${slug}`);

watchEffect(() => {
  if (entity.value) {
    useSeoMeta({
      title: title.value,
      ogTitle: title.value,
      description: description.value,
      ogDescription: description.value,
      ogUrl: url.value,
      twitterCard: 'summary_large_image',
      twitterTitle: title.value,
      twitterDescription: description.value,
      keywords: [
        ...keywords,
        'Budget Sénégal',
        entity.value.name,
        'ministère',
        'institution',
        'finances publiques',
      ].join(', '),
    });

    useHead({
      htmlAttrs: { lang: 'fr-SN' },
      link: [{ rel: 'canonical', href: url.value }],
      meta: [
        { name: 'theme-color', content: themeColor },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: siteName },
        { name: 'robots', content: 'index, follow' },
      ],
    });
  }
});
</script>

<template>
  <div class="container mx-auto py-2 pb-10 md:px-8">
    <!-- Bouton retour -->
    <div class="mb-2">
      <NuxtLink
        to="/budget-senegal"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
        Retour au budget
      </NuxtLink>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="text-center">
        <div
          class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span
            class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Chargement...</span
          >
        </div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement des données budgétaires...</p>
      </div>
    </div>

    <!-- Erreur -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      title="Erreur de chargement"
      description="Impossible de charger les données budgétaires de cette entité. Veuillez réessayer plus tard."
      class="mb-6"
    />

    <!-- Contenu principal -->
    <div v-else-if="entity">
      <!-- En-tête avec nom de l'entité -->
      <div class="prose prose-sm mx-auto my-4 sm:prose">
        <h1 class="text-center dark:text-white">{{ entity.name }}</h1>
      </div>

      <!-- Vue d'ensemble du budget -->
      <div class="mb-6 space-y-6">
        <!-- Budget total -->
        <BudgetEntityOverview
          :entity-name="entity.name"
          :current-budget="currentBudget"
          :latest-year="latestYear?.year"
          :variation="budgetVariation"
        />

        <!-- Graphique d'évolution -->
        <div
          v-if="evolutionChartData.length > 0"
          class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800"
        >
          <div class="mb-2 text-center font-bold text-gray-900 sm:text-xl dark:text-white">
            Évolution du budget par version budgétaire
          </div>
          <BudgetEntityEvolutionChart :data="evolutionChartData" />
        </div>

        <!-- Répartition par programmes -->
        <div
          v-if="formattedPrograms.length > 0"
          class="rounded-xl bg-white p-2 shadow-sm sm:p-6 dark:bg-gray-800"
        >
          <div class="font-boldtext-gray-900 mb-2 text-center sm:text-xl dark:text-white">
            Répartition du budget par programmes ({{ latestYear?.year }})
          </div>

          <BudgetEntityProgramsTable :programs="formattedPrograms" />
        </div>

        <!-- Message si aucun programme -->
        <div v-else class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <div class="py-6 text-center">
            <UIcon
              name="i-heroicons-document-chart-bar"
              class="mx-auto mb-4 h-16 w-16 text-gray-400"
            />
            <p class="text-gray-600 dark:text-gray-400">Programme budgétaire non renseigné</p>
          </div>
        </div>
      </div>

      <!-- Lien vers la page annuaire en fin de page -->
      <div class="mt-8 hidden text-center">
        <UButton
          v-if="entity.public_slug"
          :to="`/etat-senegal/annuaire/${entity.public_slug}`"
          variant="outline"
          color="primary"
          icon="i-heroicons-building-office-2"
          size="lg"
        >
          Voir la fiche complète de cette entité
        </UButton>
      </div>
    </div>
  </div>
</template>
