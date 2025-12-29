<script setup lang="ts">
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
    languageLabel: "FRANÇAIS",
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
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h2 class="text-3xl font-black uppercase tracking-tighter">
        Guide Électoral - Comment Voter
      </h2>
      <p class="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        Découvrez comment voter aux élections en vidéo, disponible en plusieurs langues nationales.
      </p>
    </div>

    <!-- Boutons de sélection de langue -->
    <div class="flex flex-wrap justify-center gap-2">
      <UButton
        color="gray"
        :variant="selectedLanguage === 'all' ? 'solid' : 'ghost'"
        :class="[
          selectedLanguage === 'all'
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800',
        ]"
        class="rounded-full px-4 transition-all duration-200"
        @click="selectedLanguage = 'all'"
      >
        Toutes les langues
      </UButton>

      <UButton
        v-for="(label, lang) in languages"
        :key="lang"
        color="gray"
        :variant="selectedLanguage === lang ? 'solid' : 'ghost'"
        :class="[
          selectedLanguage === lang
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800',
        ]"
        class="rounded-full px-4 transition-all duration-200"
        @click="selectedLanguage = selectedLanguage === lang ? 'all' : lang"
      >
        {{ label }}
      </UButton>
    </div>

    <!-- Affichage d'une seule vidéo centrée -->
    <div v-if="filteredVideos.length === 1" class="flex justify-center">
      <UCard class="w-full max-w-2xl overflow-hidden border-none shadow-xl bg-white dark:bg-gray-900 rounded-2xl">
        <div class="aspect-video w-full">
          <iframe
            :src="filteredVideos[0].url.replace('watch?v=', 'embed/')"
            class="w-full h-full rounded-lg"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div class="p-4 text-center">
          <h3 class="text-lg font-black uppercase tracking-tight">
            {{ filteredVideos[0].languageLabel }}
          </h3>
        </div>
      </UCard>
    </div>

    <!-- Affichage de plusieurs vidéos sous forme de grille -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="video in filteredVideos"
        :key="video.id"
        class="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900 rounded-2xl"
      >
        <div class="aspect-video w-full">
          <iframe
            :src="video.url.replace('watch?v=', 'embed/')"
            class="w-full h-full rounded-t-lg"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div class="p-4 text-center">
          <h3 class="text-lg font-black uppercase tracking-tight">
            {{ video.languageLabel }}
          </h3>
        </div>
      </UCard>
    </div>
  </div>
</template>
