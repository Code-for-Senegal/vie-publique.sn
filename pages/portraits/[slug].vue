<script setup lang="ts">

const route = useRoute();

const links = [
  { label: 'Nominations', to: '/nomination-senegal' }]

</script>

<template>
  <ContentDoc v-slot="{ doc }">
    <AppBreadcrumb :links=links :lastText="route.params.slug" />

    <div class="prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto mt-2">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>
</template>