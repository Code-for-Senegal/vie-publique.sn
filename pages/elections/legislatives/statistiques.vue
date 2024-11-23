<!-- pages/coalitions.vue -->
<script setup lang="ts">
const route = useRoute();

const seoTitle = "Chiffres clés Législatives 2024 Sénégal";
const seoDescription =
  "Législatives du 17 Novembre 2024 Sénégal: coalitions, listes, candidats, résultats";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://vie-publique.sn/elections/legislatives";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const {
  data: coalitions,
  pending: loadingCoalitions,
  error: errorCoalitions,
} = useCoalitions();

const {
  data: professions,
  pending: loadingProfessions,
  error: errorProfessions,
} = useElectionProfessions();

const {
  data: statsDepartmental,
  pending: loadingDepertmental,
  error: errorDepertmental,
} = useElectionStatsList();

const statsType = ref("profession");
const statsTypes = [
  { label: "Profession des candidats", value: "profession" },
  { label: "Présences des listes par département", value: "departmental" },
  { label: "Répartition des électeurs par sexe", value: "genderDistribution" },
  { label: "Répartition des électeurs par âge", value: "ageDistribution" },
];

const links = [{ label: "Élections", to: "/elections" }];
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <UButton
      v-if="coalitions"
      class="bg-gray mb-2 w-full hover:bg-white"
      size="xs"
    >
      <AppBreadcrumb :links="links" :last-text="route.params.slug" />
    </UButton>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="mb-2 text-center">Statistiques Législatives 2024</h1>
      <!-- <h3 class="mt-0 text-center">Statistiques</h3> -->
    </div>

    <UCard v-if="loadingProfessions">
      <USkeleton class="custom-shadow h-21 bg-gray mb-2 w-full" />
    </UCard>

    <UAlert v-else-if="errorProfessions" type="danger">
      {{ errorProfessions }}
    </UAlert>

    <!-- STATISTICS" -->
    <div v-else class="w-full">
      <USelect
        v-model="statsType"
        :options="statsTypes"
        placeholder="Choisir un type de statistique"
        class="input custom-shadow mb-4 w-full"
      />

      <ElectionCandidatProfessionChart
        v-if="
          statsType == 'profession' && professions && professions?.length > 0
        "
        :professions="professions"
      />

      <ElectionStatsElectoralList
        :statsDepartmental="statsDepartmental"
        v-if="statsType == 'departmental' && coalitions?.length > 0"
        :coalitions="coalitions"
      />

      <ElectionGenderDistributionChart
        v-if="statsType == 'genderDistribution'"
      />
      <ElectionAgeDistributionChart v-if="statsType == 'ageDistribution'" />
    </div>
  </div>
</template>
