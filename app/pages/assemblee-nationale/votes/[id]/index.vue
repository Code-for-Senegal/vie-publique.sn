<!-- pages/assemblee-nationale/votes/[id]/index.vue
     Redirection 301 : l'ancienne URL sans slug (/votes/:id) renvoie vers l'URL
     canonique /votes/:id/:slug. Preserve les liens partages/indexes et le lien
     d'abrogation (institutions) qui pointe encore sur un id.
     NB: fichier index.vue (et non [id].vue) pour rester frere de [slug].vue,
     sinon Nuxt en ferait le parent (NuxtPage) -> boucle de redirection. -->
<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { data } = await useAsyncData(`vote-redirect-${id}`, () =>
  $fetch<{ vote?: { slug?: string; name?: string } }>(`/api/assembly/votes/${id}`).catch(
    () => null,
  ),
);

const slug = data.value?.vote?.slug;

if (!slug) {
  throw createError({ statusCode: 404, statusMessage: 'Vote parlementaire introuvable' });
}

await navigateTo(`/assemblee-nationale/votes/${id}/${slug}`, {
  redirectCode: 301,
  replace: true,
});
</script>

<template>
  <div />
</template>
