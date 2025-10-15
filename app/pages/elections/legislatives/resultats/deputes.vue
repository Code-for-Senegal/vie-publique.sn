<!-- pages/deputies.vue -->
<template>
  <div>
    <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Législatives 2024', to: '/elections' },
        { label: 'Députés' },
      ]"
    />
    <ElectionResultDeputiesGrid />
  </div>
</template>

<script setup>
const seoTitle = "Élections Législatives 2024 Sénégal - Classement des listes";
const seoDescription =
  "Élections Législatives anticipées du 17 Novembre 2024 Sénégal: classement des listes";
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
</script>
