<script setup lang="ts">
useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const search = ref("");
const results = ref([]);

// Champs à utiliser pour la recherche
const miniSearchOptions = defineMiniSearchOptions({
  fields: ["title", "description", "body"],
});

// Observer les changements dans la requête de recherche
watch(search, async (newQuery) => {
  if (newQuery) {
    try {
      // Si une requête est présente, exécuter la recherche
      const searchResults = await searchContent(search, {
        miniSearch: miniSearchOptions,
      });

      results.value = searchResults;
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
      results.value = [];
    }
  } else {
    // Si la recherche est vide, réinitialiser les résultats
    results.value = [];
  }
});

// Fonction pour mettre en surbrillance les mots correspondants dans le texte
const highlightMatch = (text, query) => {
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, '<span class="highlight">$1</span>');
};
</script>

<template>
  <main>
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Journal Officiel</h1>
    </div>

    <div class="text-center text-sm text-gray-500">
      <p>
        💡 Travail de numérisation en cours, Retrouvez ici bientôt l'historique
        complet des JO publiés depuis 2001.
      </p>
    </div>

    <!-- Champ de recherche -->
    <UInput
      v-model="search"
      size="md"
      placeholder="Rechercher par numéro, date ou contenu"
      icon="i-heroicons-magnifying-glass"
      class="input custom-shadow my-4 w-full"
    />

    <!-- <pre>{{ results }}</pre> -->
    <!-- Résultats de recherche -->
    <div v-if="search" class="flex flex-col gap-2">
      <UCard
        v-for="article in results"
        :key="article.id"
        class="custom-shadow cursor-pointer"
      >
        <NuxtLink :to="article.id">
          <p class="font-semibold underline">{{ article.title }}</p>
          <span v-html="highlightMatch(article.content, search)"></span>
        </NuxtLink>
      </UCard>
      <pre>{{ results }}</pre>
    </div>

    <!-- Liste des articles si aucune recherche n'est effectuée -->
    <ContentList v-else path="/journal-officiel-senegal" v-slot="{ list }">
      <div class="flex flex-col gap-2">
        <UCard
          v-for="article in list"
          :key="article._path"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink :to="article._path">
            <p class="font-semibold underline">{{ article.title }}</p>
            <p class="mt-1 text-sm text-gray-500">{{ article.subtitle }}</p>
          </NuxtLink>
        </UCard>
      </div>
    </ContentList>
  </main>
</template>

<style scoped>
.highlight {
  background-color: yellow;
}
</style>
