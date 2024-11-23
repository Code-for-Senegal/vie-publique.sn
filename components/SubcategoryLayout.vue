<!-- SubcategoryLayout.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
    <!-- Container principal avec padding adaptatif -->
    <div class="container mx-auto px-4 py-4 sm:py-8">
      <!-- En-tête adaptatif -->
      <div class="prose prose-sm mx-auto mb-6 text-center sm:mb-12">
        <h1 class="px-2 text-2xl font-bold text-gray-900 sm:text-3xl">
          {{ title }}
        </h1>
        <p class="mt-2 px-4 text-sm text-gray-600 sm:mt-4 sm:text-base">
          Découvrez toutes les informations sur les élections législatives 2024
        </p>
      </div>

      <!-- Grille optimisée pour mobile -->
      <div class="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        <div v-for="menu in item" :key="menu.title" class="group">
          <UCard
            :class="[
              menu.display ? '' : 'opacity-60',
              'transform rounded-lg border-0 shadow transition-all duration-300 sm:rounded-xl',
              'active:scale-98 hover:shadow-lg', // Retour visuel sur mobile
            ]"
          >
            <NuxtLink
              :to="menu.display ? menu.to : '#'"
              class="block p-4 sm:p-6"
            >
              <div class="flex items-center space-x-4">
                <!-- Icône adaptative -->
                <div
                  :class="[
                    'flex flex-shrink-0 items-center justify-center rounded-full',
                    'h-12 w-12 sm:h-14 sm:w-14',
                    menu.display ? menu.color : 'bg-gray-200 text-gray-700',
                  ]"
                >
                  <UIcon :name="menu.icon" class="h-6 w-6 sm:h-7 sm:w-7" />
                </div>

                <!-- Contenu texte -->
                <div class="flex-grow">
                  <h2
                    class="text-lg font-semibold leading-tight text-gray-900 sm:text-xl"
                  >
                    {{ menu.title }}
                  </h2>
                  <p
                    v-if="menu.description"
                    class="mt-1 line-clamp-2 text-sm text-gray-600"
                  >
                    {{ menu.description }}
                  </p>
                </div>

                <!-- Flèche indiquant l'action -->
                <div v-if="menu.display" class="flex-shrink-0">
                  <UIcon
                    name="i-heroicons-chevron-right"
                    class="h-5 w-5 text-gray-400"
                  />
                </div>
              </div>
            </NuxtLink>
          </UCard>
        </div>
      </div>

      <!-- Navigation rapide fixe en bas (optionnel) -->
      <div class="fixed bottom-0 left-0 right-0 border-t bg-white md:hidden">
        <div class="flex justify-around p-2">
          <button
            v-for="(category, index) in visibleCategories"
            :key="index"
            class="flex flex-col items-center p-2"
            @click="scrollToCategory(index)"
          >
            <UIcon
              :name="category.icon"
              class="h-6 w-6"
              :class="category.color"
            />
            <span class="mt-1 text-xs">{{
              category.shortTitle || category.title
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MenuItem {
  display: boolean;
  title: string;
  shortTitle?: string; // Titre court pour la navigation mobile
  description?: string;
  icon: string;
  to: string;
  color: string;
}

const props = defineProps<{
  item: MenuItem[];
  title: string;
}>();

// Filtrer uniquement les catégories visibles pour la navigation rapide
const visibleCategories = computed(() =>
  props.item.filter((item) => item.display).slice(0, 4),
);

// Fonction pour scroller vers une catégorie
const scrollToCategory = (index: number) => {
  const elements = document.querySelectorAll(".group");
  if (elements[index]) {
    elements[index].scrollIntoView({ behavior: "smooth" });
  }
};

// Optimisation du chargement sur mobile
onMounted(() => {
  if (window.innerWidth < 768) {
    // Préchargement des images et icônes importantes
    const icons = props.item.map((item) => item.icon);
    icons.forEach((icon) => {
      const img = new Image();
      img.src = icon;
    });
  }
});
</script>

<style scoped>
/* Styles spécifiques pour le défilement sur mobile */
@media (max-width: 768px) {
  .container {
    padding-bottom: 4rem; /* Espace pour la navigation fixe */
  }

  /* Éviter le débordement horizontal */
  .prose {
    max-width: 100%;
    overflow-wrap: break-word;
  }
}

/* Animation subtile au toucher sur mobile */
@media (hover: none) {
  .group:active {
    transform: scale(0.98);
  }
}

/* Optimisation des transitions pour mobile */
.group {
  -webkit-tap-highlight-color: transparent;
}

/* Amélioration de la performance de défilement */
* {
  -webkit-overflow-scrolling: touch;
}
</style>
