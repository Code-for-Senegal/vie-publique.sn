<template>
  <div class="flex flex-col items-center px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Résultats Global Législatives 2024</h1>
    </div>
    <ElectionResultGlobal />
  </div>
</template>

<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex" }],
});
// Le composant sera automatiquement importé grâce à l'auto-import de Nuxt 3
</script>
