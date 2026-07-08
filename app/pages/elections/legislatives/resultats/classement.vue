<!-- pages/deputies.vue -->
<template>
  <div class="min-h-screen pb-16">
    <AppBreadcrumb
:items="[
      { label: 'Élections', to: '/elections' },
      { label: 'Législatives 2024', to: '/elections/legislatives' },
      { label: 'Résultats', to: '/elections/legislatives/resultats' },
      { label: 'Classement' }
    ]" />

    <div class="w-full">
      <UCard v-if="loadingCoalitions">
        <USkeleton class="custom-shadow h-21 bg-gray mb-2 w-full" />
      </UCard>

      <UAlert v-else-if="errorCoalitions" type="danger">
        {{ errorCoalitions }}
      </UAlert>
      <ElectionResultClassement
        v-if="coalitions?.length > 0"
        :coalitions="coalitions"
        :loading="loadingCoalitions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const seoTitle = "Élections Législatives 2024 Sénégal - Classement des listes";
const seoDescription =
  "Élections Législatives anticipées du 17 Novembre 2024 Sénégal: classement des listes";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://www.vie-publique.sn/elections/legislatives";
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
} = useCoalitions(null, true);
</script>
