<script setup lang="ts">
const route = useRoute();

const seoTitle = "Communiqué Conseil des ministres Sénégal";
const seoDescription =
  "Communiqué conseil des ministres du gouvernement du Sénégal";
const seoImgPath = "/images/share-conseil-des-ministres-nomination-full.jfif";
const seoPageUrl =
  "https://vie-publique.sn/conseil-des-ministres/" + route.params.slug;

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const links = [{ label: "communiqués", to: "/conseil-des-ministres" }];
</script>

<template>
  <ContentDoc v-slot="{ doc }">
    <AppBreadcrumb :links="links" :last-text="route.params.slug" />

    <div class="prose prose-sm sm:prose mx-auto">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>

  <ScrollToTopButton />
</template>
