<template>
  <div class="min-h-screen flex flex-col px-4 pb-16">
    <AppBreadcrumb :items="[
      { label: 'État du Sénégal', to: '/etat-senegal' },
      { label: 'Organisation de l\'État' }
    ]" />

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center dark:text-white">Organisation de l'État</h1>
    </div>

    <div class="mb-2 text-center text-sm text-gray-500">
      <p>
        Selon le Décret n° 2024-940 portant répartition des services de l'Etat
      </p>
    </div>

    <EtatOrganisation />
  </div>
</template>

<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex" }],
});
</script>
