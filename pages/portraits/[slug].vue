<script setup lang="ts">
const route = useRoute();

const links = [{ label: "Nominations", to: "/nomination-senegal" }];
</script>

<template>
  <ContentDoc v-slot="{ doc }">
    <AppBreadcrumb :links="links" :last-text="route.params.slug" />

    <div class="prose prose-sm sm:prose lg:prose-md mx-auto">
      <ContentRenderer :value="doc" />
    </div>
  </ContentDoc>
</template>
