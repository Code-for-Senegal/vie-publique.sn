<!-- pages/assemblee-nationale/questions/[id]/index.vue
     Redirection 301 : l'ancienne URL sans slug (/questions/:id) renvoie vers l'URL
     canonique /questions/:id/:slug. Preserve les liens partages/indexes.
     NB: fichier index.vue (et non [id].vue) pour rester frere de [slug].vue,
     sinon Nuxt en ferait le parent (NuxtPage) -> boucle de redirection. -->
<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;

const { data } = await useAsyncData(`question-redirect-${id}`, () =>
  $fetch<{ question?: { slug?: string; subject?: string } }>(`/api/assembly/questions/${id}`).catch(
    () => null,
  ),
);

const slug = data.value?.question?.slug;

if (!slug) {
  throw createError({ statusCode: 404, statusMessage: 'Question parlementaire introuvable' });
}

await navigateTo(`/assemblee-nationale/questions/${id}/${slug}`, {
  redirectCode: 301,
  replace: true,
});
</script>

<template>
  <div />
</template>
