<script setup lang="ts">

const route = useRoute();

const { data } = await useAsyncData('content', () => queryContent(route.path).findOne())

useHead({
  meta: [
    { name: 'robots', content: data.value?.robots || 'index,follow' }
  ]
})

const links = [
  // { label: 'Justice', to: '/justice' }]
  { label: 'Actualités', to: '/publications/actualites' }]


</script>
<template>
  <ContentDoc v-slot="{ doc }">
    <AppBreadcrumb :links=links :lastText="route.params.slug[1]" />

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