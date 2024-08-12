<script setup lang="ts">

const seoTitle = 'Code général de la république du Sénégal';
const seoDescription = 'Sénégal Constitution, Code de la famille, Code du travail, Code des collectivités locales, Code de la presse';
const seoImgPath = '/vpsn-share-jors.png';
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

const { data: codes, pending, error } = await useAsyncData('codes', () =>
  queryContent('code-senegal').find(),
  { server: true, lazy: false }
)

const filteredCodes = computed(() => {
  if (!codes.value) return []
  return codes.value.filter(code =>
    code.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="container mx-auto px-4">

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">
        Codes
      </h1>
    </div>

    <div class="text-center">
      <p v-if="filteredCodes.length > 1" class="text-sm mb-2 text-gray-500">
        {{ filteredCodes.length }} Codes référencés
      </p>
    </div>

    <!-- <UInput size="md" v-model="searchQuery" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass"
      class="input w-full my-4 custom-shadow" /> -->

    <div v-if="pending">Chargement...</div>
    <div v-else-if="error">Une erreur s'est produite lors du chargement des textes.</div>
    <div v-else>
      <div class="flex flex-col gap-2">
        <UCard v-for="codeItem in filteredCodes" :key="codeItem._path" class="cursor-pointer custom-shadow">
          <NuxtLink :to="codeItem._path">
            <p class="font-semibold underline">
              <!-- <UIcon name="i-heroicons-document" />&nbsp; -->
              {{ codeItem.title }}
            </p>
            <p class="text-gray-500 text-sm">{{ codeItem.subtitle }}</p>
          </NuxtLink>
        </UCard>
      </div>
    </div>
  </div>
</template>