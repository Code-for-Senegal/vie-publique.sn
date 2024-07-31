<script setup lang="ts">

const route = useRoute();

const links = [
  // { label: 'Accueil', to: '/' },
  { label: 'Codes', to: '/code-senegal' }]

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