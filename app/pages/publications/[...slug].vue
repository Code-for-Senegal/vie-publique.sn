<script setup lang="ts">
const route = useRoute();

const { data } = await useAsyncData("content", () =>
  queryContent(route.path).findOne(),
);

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const links = [
  { label: route.params.slug[0], to: "/publications/" + route.params.slug[0] },
];
</script>
<template>
  <ContentDoc v-slot="{ doc }">
    <AppBreadcrumb :links="links" :last-text="route.params.slug[1]" />

    <div class="prose prose-sm sm:prose lg:prose-md dark:prose-invert mx-auto">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>
</template>

<style>
.prose div h3 a {
  text-decoration: none;
}
</style>
