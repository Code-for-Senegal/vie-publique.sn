<script setup lang="ts">

// Définition des métadonnées SEO
const seoTitle = 'Actualités de la république du Sénégal';
const seoDescription = 'Information Actualités de la république du Sénégal';
const seoImgPath = 'https://vie-publique.sn/images/share-linkedin.png';
const seoPageUrl = 'https://vie-publique.sn/publications/actualites';

// Configuration des métadonnées pour le SEO et le partage social
useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    // Twitter Card Meta Tags
    { name: "twitter:title", content: seoTitle },
    { name: "twitter:description", content: seoDescription },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags pour Facebook et autres
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ]
})

// État réactif pour la catégorie sélectionnée, initialisé à 'Toutes'
const selectedCategory = ref('Toutes')

// Récupération des données des actualités depuis le CMS
const { data: contentItems, pending, error } = await useAsyncData('contentItems', () =>
  queryContent('publications/actualites').find(),
  { server: true, lazy: false }
)

// Calcul des catégories uniques avec le nombre d'articles pour chaque catégorie
const categoriesWithCount = computed(() => {
  if (!contentItems.value) return [{ name: 'Toutes', count: 0 }]
  
  const categoryCounts = contentItems.value.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})

  const allCount = contentItems.value.length
  
  return [
    { name: 'Toutes', count: allCount },
    ...Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))
  ]
})

// Filtrage des actualités en fonction de la catégorie sélectionnée
const filteredContentItems = computed(() => {
  if (!contentItems.value) return []
  return contentItems.value.filter(item =>
    selectedCategory.value === 'Toutes' || item.category === selectedCategory.value
  )
})

// Fonction utilitaire pour obtenir l'URL de l'image (avec une image par défaut si non spécifiée)
function getImageUrl(item) {
  return item.image || '/chemin/vers/image/par-defaut.jpg'
}

// Tri des actualités filtrées par date, du plus récent au plus ancien
const sortedContentItems = computed(() => {
  return [...filteredContentItems.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Titre principal de la page -->
    <h1 class="text-4xl font-bold text-center mb-8 text-gray-800">Actualités</h1>

    <!-- Boutons de filtrage par catégorie avec nombre d'articles -->
    <div class="flex flex-wrap justify-center gap-4 mb-8">
      <UButton
        v-for="category in categoriesWithCount"
        :key="category.name"
        :color="selectedCategory === category.name ? 'primary' : 'gray'"
        @click="selectedCategory = category.name"
        class="text-sm px-4 py-2 rounded-full transition-all duration-300 ease-in-out"
      >
        {{ category.name }} ({{ category.count }})
      </UButton>
    </div>

    <!-- Affichage du spinner pendant le chargement des données -->
    <div v-if="pending" class="text-center py-8">
      <USpinner size="lg" class="mb-4" />
      <p class="text-gray-600">Chargement des actualités...</p>
    </div>
    
    <!-- Affichage d'une alerte en cas d'erreur -->
    <UAlert v-else-if="error" icon="i-heroicons-exclamation-triangle" color="red" title="Erreur de chargement" :description="error.message" />
    
    <!-- Affichage des actualités -->
    <div v-else>
      <!-- Message si aucun résultat n'est trouvé -->
      <div v-if="sortedContentItems.length === 0" class="text-center text-gray-500 mt-8 flex flex-col items-center">
        <UIcon name="i-heroicons-exclamation-circle" class="w-16 h-16 mb-4 text-gray-400" />
        <p class="text-xl">Aucun résultat disponible</p>
      </div>
      <!-- Grille des actualités -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Carte pour chaque actualité -->
        <UCard v-for="item in sortedContentItems" :key="item._path" class="overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <NuxtLink :to="item._path" class="block">
            <!-- Image de l'actualité avec catégorie -->
            <div class="relative">
              <img :src="getImageUrl(item)" :alt="item.title" class="w-full h-56 object-cover transition-transform duration-300 hover:scale-105">
              <span class="absolute top-0 left-0 bg-primary-600 text-white px-3 py-1 text-sm font-semibold">
                {{ item.category }}
              </span>
            </div>
            <div class="p-4">
              <!-- Métadonnées de l'actualité (date) -->
              <div class="flex justify-end items-center mb-2">
                <span class="text-sm text-gray-600">
                  {{ $dateformatWithDayName(item.date) }}
                </span>
              </div>
              <!-- Titre et description de l'actualité -->
              <h2 class="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{{ item.title }}</h2>
              <p class="text-gray-600 line-clamp-3">{{ item.description }}</p>
            </div>
          </NuxtLink>
        </UCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Classes utilitaires pour limiter le nombre de lignes affichées */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>