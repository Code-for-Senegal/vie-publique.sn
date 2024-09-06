<script setup lang="ts">

const seoTitle = 'Actualités de la république du Sénégal';
const seoDescription = 'Information Actualités  de la république du Sénégal';
const seoImgPath = 'https://vie-publique.sn/images/share-linkedin.png';
const seoPageUrl = 'https://vie-publique.sn/publications/actualites';
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

const { data: contentItems, pending, error } = await useAsyncData('contentItems', () =>
  queryContent('publications/actualites').find(),
  { server: true, lazy: false }
)

const filteredContentItems = computed(() => {
  if (!contentItems.value) return []
  return contentItems.value.filter(code =>
    code.title?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Ajoutez cette fonction pour obtenir une image par défaut si aucune n'est spécifiée
function getImageUrl(item) {
  return item.image || '/chemin/vers/image/par-defaut.jpg'
}
</script>

<template>
  <div class="container mx-auto px-4">

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">
        Actualités
      </h1>
    </div>

    <div class="text-center">
      <p v-if="filteredContentItems.length > 1" class="text-sm mb-2 text-gray-500">
        Communiqués, discours, annonces, déclarations, etc.
      </p>
    </div>

    <UInput size="md" v-model="searchQuery" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass"
      class="hidden input w-full my-4 custom-shadow" />

    <div v-if="pending">Chargement...</div>
    <div v-else-if="error">Une erreur s'est produite lors du chargement des actualités.</div>
    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard class="cursor-pointer custom-shadow">
          <NuxtLink to="/medias">
            <img src="/images/actu-presse-en-ligne-senegal-sites-internet-informations-senegal.jpg"
              alt="Aide à la presse" class="w-full h-48 object-cover mb-4" fetchpriority="high">
            <div class="siteweb-type inline-block px-2 py-1 my-1 text-xs bg-gray-200 text-gray-800">
              Article
            </div>
            <div class="text-gray-800 text-sm">
              {{ $dateformatWithDayName("2024-08-20") }}
            </div>
            <p class="font-semibold">
              Classement aides à la presse 2023
            </p>

          </NuxtLink>
        </UCard>
        <UCard v-for="item in filteredContentItems" :key="item._path" class="cursor-pointer custom-shadow">
          <NuxtLink :to="item._path">
            <img :src="getImageUrl(item)" :alt="item.title" class="w-full h-48 object-cover mb-4" fetchpriority="high">
            <div class="siteweb-type inline-block px-2 py-1 my-1 text-xs bg-gray-200 text-gray-800">
              {{ item.category }}
            </div>
            <div class="text-gray-800 text-sm">
              {{ $dateformatWithDayName(item.date) }}
            </div>
            <p class="font-semibold">
              {{ item.title }}
            </p>

          </NuxtLink>
        </UCard>
      </div>
    </div>
  </div>
</template>