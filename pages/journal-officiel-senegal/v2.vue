<script lang="ts" setup>
useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const searchTerm = ref("");

const { data: articles, refresh } = await useAsyncData("posts", () =>
  queryContent("journal-officiel-senegal")
    .only(["title", "subtitle", "description", "content"])
    .where({
      $or: [
        { title: { $contains: searchTerm.value } },
        { description: { $contains: searchTerm.value } },
        { content: { $contains: searchTerm.value } },
      ],
    })
    .limit(10)
    .find(),
);

const search = () => {
  refresh();
};

// Fonction pour mettre en surbrillance les correspondances
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
        complète des JO publiés deuis 2001
      </p>
    </div>

    <UInput
      v-model="searchTerm"
      @input="search"
      size="md"
      placeholder="Rechercher par numéro ou date"
      icon="i-heroicons-magnifying-glass"
      class="input custom-shadow my-4 w-full"
    />
    <div v-if="searchTerm" class="flex flex-col gap-2">
      <UCard
        v-for="article in articles"
        :key="article._path"
        class="custom-shadow cursor-pointer"
      >
        <NuxtLink :to="article._path">
          <p class="font-semibold underline">{{ article.title }}</p>

          <p class="mt-1 text-sm text-gray-500">{{ article.subtitle }}</p>
        </NuxtLink>
      </UCard>
    </div>

    <!-- <UInput
      v-model="searchString"
      size="md"
      placeholder="Rechercher par numéro ou date"
      icon="i-heroicons-magnifying-glass"
      class="input custom-shadow my-4 w-full"
    />

    <ContentList
      v-if="searchString"
      path="`/journal-officiel-senegal"
      fields="title, thumbnail, date"
      :query="{
        draft: false,
        sort: [
          {
            date: -1,
          },
        ],
      }"
      v-slot="{ list }"
    >
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
    </ContentList> -->

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
