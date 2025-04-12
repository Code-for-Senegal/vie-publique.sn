<template>
  <!-- <div class="container mx-auto p-4"> -->
  <div class="flex flex-col items-center px-4">
    <UButton size="xs" class="bg-gray b-0 mb-1 w-full hover:bg-white">
      <AppBreadcrumb :links="links" :last-text="route.params.slug" />
    </UButton>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Comment voter aux élections législatives ?</h1>
    </div>

    <!-- Boutons de sélection de langue -->
    <div class="my-3 w-full text-center">
      <UButton
        :key="'all'"
        class="custom-shadow mb-1 ml-1 hidden"
        :color="selectedLanguage === 'all' ? 'white' : 'gray'"
        :class="
          selectedLanguage === 'all'
            ? 'border-b border-green-700 font-semibold text-green-700'
            : ''
        "
        size="xl"
        @click="selectedLanguage = 'all'"
      >
        Toutes les vidéos
      </UButton>

      <UButton
        v-for="(label, lang) in languages"
        :key="lang"
        :color="selectedLanguage === lang ? 'white' : 'gray'"
        :class="[
          selectedLanguage === lang
            ? 'border-green-700 bg-green-700 text-white hover:text-green-700'
            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-700',
        ]"
        class="custom-shadow mb-1 ml-1 rounded-md border px-4 py-2 text-sm font-medium transition duration-200 ease-in-out"
        @click="selectedLanguage = selectedLanguage === lang ? '' : lang"
      >
        {{ label }}
      </UButton>
    </div>

    <!-- Affichage de la vidéo ou des vidéos -->
    <div v-if="filteredVideos.length === 1" class="flex justify-center">
      <!-- Affichage d'une seule vidéo centrée -->
      <div class="w-full max-w-lg rounded-lg bg-white p-2 shadow-lg">
        <iframe
          :src="filteredVideos[0].url.replace('watch?v=', 'embed/')"
          class="video h-60 w-full rounded-lg"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <h3 class="mt-2 text-center text-lg font-semibold">
          {{ filteredVideos[0].languageLabel }}
        </h3>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
      <!-- Affichage de plusieurs vidéos sous forme de grille -->
      <div
        v-for="video in filteredVideos"
        :key="video.id"
        class="rounded-lg bg-white p-4 shadow-lg"
      >
        <iframe
          :src="video.url.replace('watch?v=', 'embed/')"
          class="video h-48 w-full rounded-lg"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
        <h3 class="mt-2 text-center text-lg font-semibold">
          {{ video.languageLabel }}
        </h3>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

// Liste des vidéos avec leurs liens et langues
const videos = [
  {
    id: 1,
    language: "wolof",
    languageLabel: "WOLOF",
    url: "https://www.youtube.com/watch?v=Mo4PO6ya_9E",
  },
  {
    id: 2,
    language: "français",
    languageLabel: "FRANCAIS",
    url: "https://www.youtube.com/watch?v=Mo4PO6ya_9E",
  },
  {
    id: 3,
    language: "diola",
    languageLabel: "DIOLA",
    url: "https://www.youtube.com/watch?v=y58vuW_-nOU",
  },
  {
    id: 4,
    language: "serere",
    languageLabel: "SERERE",
    url: "https://www.youtube.com/watch?v=PdJaehoTNQs",
  },
  {
    id: 5,
    language: "pular",
    languageLabel: "PULAR",
    url: "https://www.youtube.com/watch?v=T2qJzzujorA",
  },
  {
    id: 6,
    language: "manjak",
    languageLabel: "MANJAK",
    url: "https://www.youtube.com/watch?v=7V9mu4P6yCQ",
  },
];

// Options de langues pour le filtre
const languages = {
  wolof: "Wolof",
  diola: "Diola",
  serere: "Serere",
  pular: "Pular",
  manjak: "Manjak",
};

// État pour le filtre de langue
const selectedLanguage = ref("all");

// Filtrer les vidéos en fonction de la langue sélectionnée
const filteredVideos = computed(() => {
  if (selectedLanguage.value === "all" || !selectedLanguage.value) {
    return videos;
  }
  return videos.filter((video) => video.language === selectedLanguage.value);
});

const links = [{ label: "Tableau de Bord Élections", to: "/elections" }];
</script>

<style scoped>
.container {
  max-width: 800px;
}
</style>
