<script setup lang="ts">
/**
 * Page de redirection : /nomination-senegal/[id]/[slug] -> /personnalites/[id]/[slug]
 * Conservée pour la rétrocompatibilité des URLs existantes
 */
const route = useRoute()

// Redirection permanente (301) vers la nouvelle structure /personnalites
navigateTo(`/personnalites/${route.params.id}/${route.params.slug}`, {
  redirectCode: 301,
})
</script>

<template>
  <div></div>
</template>
