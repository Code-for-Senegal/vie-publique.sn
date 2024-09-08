<script setup lang="ts">
const route = useRoute();

const links = [{ label: "Rapports", to: "/rapport-senegal" }];

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});
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
