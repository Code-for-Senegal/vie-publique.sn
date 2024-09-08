<script setup lang="ts">
const route = useRoute();

const { data } = await useAsyncData("content", () =>
  queryContent(route.path).findOne(),
);

useHead({
  meta: [{ name: "robots", content: data.value?.robots || "index,follow" }],
});

const links = [
  { label: route.params.slug[0], to: "/publications/" + route.params.slug[0] },
];
</script>
<template>
  <ContentDoc v-slot="{ doc }">
    <AppBreadcrumb :links="links" :last-text="route.params.slug[1]" />

    <div class="prose prose-sm sm:prose lg:prose-md mx-auto">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>
</template>

<style>
.prose div h3 a {
  text-decoration: none;
}

.prose p a {
  /* text-decoration: none; */
  color: rgb(37 99 235);
}
</style>
