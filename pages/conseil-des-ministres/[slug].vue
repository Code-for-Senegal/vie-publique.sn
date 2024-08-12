<script setup lang="ts">

const route = useRoute();

const seoTitle = 'Communiqué Conseil des ministres Sénégal';
const seoDescription = 'Communiqué conseil des ministres du gouvernement du Sénégal';
const seoImgPath = '/images/share-conseil-des-ministres-nomination-full.jfif';
const seoPageUrl = 'https://vie-publique.sn/conseil-des-ministres/' + route.params.slug;

useHead({
  title: seoTitle,
  meta: [
    {
      name: 'description',
      content: seoDescription
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle
    },
    {
      name: "twitter:description",
      content: seoDescription
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
      content: seoDescription
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "article" },
  ]
})


const links = [
  { label: 'communiqués', to: '/conseil-des-ministres' }]

</script>

<template>
  <ContentDoc v-slot="{ doc }">
    <AppBreadcrumb :links=links :lastText="route.params.slug" />

    <div class="prose prose-sm sm:prose mx-auto">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>

  <ScrollToTopButton />
</template>