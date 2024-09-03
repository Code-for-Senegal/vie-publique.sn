<script setup lang="ts">

const seoTitle = 'Journal officiel Sénégal';
const seoDescription = 'Journal officiel de la république du Sénégal';
const seoImgPath = '/images/vpsn-share-jors-4.png';
const seoPageUrl = 'https://vie-publique.sn/journal-officiel-senegal/2024';
useHead({
  title: seoTitle,
  meta: [
    {
      name: 'description',
      content: seoDescription
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle
    },
    {
      name: "twitter:description",
      content: seoDescription
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ]
})

const searchQuery = ref('')

const { data: journaux, pending, error } = await useAsyncData('journaux', () =>
  queryContent('journal-officiel-senegal').find(),
  { server: true, lazy: false }
)

const filteredJournals = computed(() => {
  if (!journaux.value) return []
  return journaux.value.filter(journal =>
    journal.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    journal.numero?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    journal.subtitle?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="container mx-auto px-4">

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">
        Journal Officiel
      </h1>
    </div>
    <div class="text-center text-gray-500 text-sm">
      <p>
        {{ filteredJournals.length }} Journaux référencés
      </p>
      <p>
        💡 Travail de numérisation en cours, Retrouvez ici bientôt l'historique complète des JO publiés en 2024
      </p>
    </div>

    <UInput size="md" v-model="searchQuery" placeholder="Rechercher par numéro ou date"
      icon="i-heroicons-magnifying-glass" class="input w-full my-4 custom-shadow" />

      <div v-if="pending">Chargement...</div>
    <div v-else-if="error">Une erreur s'est produite lors du chargement des journaux.</div>
    <div v-else>
      <div v-if="filteredJournals.length === 0" class="text-center text-gray-500 mt-4 flex flex-col items-center">
        <UIcon name="i-heroicons-exclamation-circle" class="w-12 h-12 mb-2" />
        <p>Aucun résultat disponible</p>
      </div>
      <div v-else class="flex flex-col gap-2">
        <UCard v-for="journal in filteredJournals" :key="journal._path" class="cursor-pointer custom-shadow">
          <NuxtLink :to="journal._path">
            <p class="font-semibold underline">{{ journal.title }}</p>
            <p class="text-gray-500 text-sm">{{ journal.subtitle }}</p>
          </NuxtLink>
        </UCard>
      </div>
    </div>
  </div>
</template>