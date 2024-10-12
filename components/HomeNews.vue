<script lang="ts" setup>
const starNews = [
  {
    _path: "conseil-des-ministres/conseil-des-ministres-du-09-octobre-2024",
    title: "Conseil des ministres du 09 octobre 2024",
    date: "2024-10-08",
    category: "Conseil des ministres",
    image: "/images/communique-conseil-des-ministres-2.jpg",
  },
  {
    _path:
      "/publications/actualites/reunion-interministerielle-sur-le-retour-des-deplaces-de-casamance",
    title: "Réunion interministérielle sur le retour des déplacés de Casamance",
    date: "2024-10-08",
    category: "Conseil interministériel",
    image:
      "/images/actualites/reunion-interministerielle-sur-le-retour-des-deplaces-de-casamance.jpeg",
  },
  {
    _path: "conseil-des-ministres/conseil-des-ministres-du-02-octobre-2024",
    title: "Conseil des ministres du 02 octobre 2024",
    date: "2024-10-02",
    category: "Conseil des ministres",
    image: "/images/communique-conseil-des-ministres-4.jpg",
  },
  {
    _path:
      "/publications/actualites/reddition-des-comptes-debut-des-poursuites",
    title: "Reddition des comptes, Poursuites judiciaires",
    date: "2024-09-30",
    category: "Article",
    image: "/images/actualites/reddition-des-compte-debut-poursuites.png",
  },
  {
    _path:
      "/publications/actualites/point-de-presse-du-gouvernement-26-09-2024",
    title: "Point de presse du gouvernement, état des lieux du pays",
    date: "2024-09-26",
    category: "Articles",
    image: "/images/actualites/point-de-presse-du-gouvernement-26-09-2024.jpeg",
  },
  {
    _path: "/publications/actualites/discours-president-diomaye-onu-2024",
    title: "Discours du président Diomaye à la 79e session de l'ONU",
    date: "2024-09-25",
    category: "Discours",
    image: "/images/actualites/diomaye-onu-79e-session-2024.webp",
  },
  // {
  //   _path:
  //     "/publications/actualites/mise-en-service-du-pool-judiciaire-financier",
  //   title: "Mise en service du Pool judiciaire financier du Sénégal",
  //   date: "2024-09-17",
  //   category: "Article",
  //   image: "/images/actualites/palais_justice_dakar.jpg",
  // },
  // {
  //   _path: "conseil-des-ministres/conseil-des-ministres-du-18-septembre-2024",
  //   title: "Conseil des ministres du 18 septembre 2024",
  //   date: "2024-09-18",
  //   category: "Conseil des ministres",
  //   image: "/images/actualites/conseil-des-ministres-18-septembre-2024.png",
  // },

  // {
  //   _path: "/budget-senegal",
  //   title: "Suivi de l'exécution du Budget du Sénégal",
  //   date: null,
  //   category: "Tableau de bord",
  //   image: "/images/actualites/budget-2024.PNG",
  // },

  // {
  //   _path: "/publications/actualites/dissolution-de-lassemblee-nationale",
  //   title: "Dissolution de l'assemblé nationale",
  //   date: "2024-09-13",
  //   category: "Discours",
  //   image: "/images/actualites/dissolution-de-lassemblee-nationale.jpeg",
  // },

  // {
  //   _path: "/publications/actualites/discours-president-diomaye-focac",
  //   title: "Discours du président Diomaye au sommet du forum Sino-Africain",
  //   date: "2024-09-05",
  //   category: "Discours",
  //   image: "/images/actualites/diomaye-chine-focac-1.jpeg",
  // },
];
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
    <UCard
      v-for="item in starNews"
      :key="item._path"
      class="custom-shadow cursor-pointer"
    >
      <NuxtLink :to="item._path" class="flex flex-row sm:flex-col">
        <div class="mb-0 mr-4 w-1/3 sm:mb-4 sm:mr-0 sm:w-full">
          <NuxtImg
            :src="item.image"
            :alt="item.title"
            class="h-24 w-full object-cover sm:h-48"
            loading="lazy"
            fetchpriority="high"
            sizes="300px"
            :placeholder="[300, 300]"
          />
        </div>
        <div class="flex-1">
          <div
            class="siteweb-type my-1 inline-block bg-gray-200 px-2 py-1 text-xs text-gray-800"
          >
            {{ item.category }}
          </div>

          <p class="text-sm font-semibold sm:text-base">
            {{ item.title }}
          </p>
          <div v-if="item.date" class="text-sm text-gray-800">
            {{ $dateformatWithDayName(item.date) }}
          </div>
        </div>
      </NuxtLink>
    </UCard>
  </div>
</template>
