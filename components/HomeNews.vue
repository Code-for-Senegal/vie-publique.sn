<script lang="ts" setup>
const starNews = [
  {
    _path: "/publications/actualites/projet-loi-de-finance-2025",
    title: "Projet de loi de finances 2025",
    date: "2024-12-13",
    category: "Article",
    image: "/images/actualites/projet-loi-finance-initiale-2025.PNG",
  },
  {
    _path: "/conseil-des-ministres/conseil-des-ministres-du-11-decembre-2024",
    title: "Conseil des ministres du 11 décembre 2024",
    date: "2024-12-11",
    category: "Conseil des ministres",
    image: "/images/communique-conseil-des-ministres-5.jpg",
  },
  {
    _path:
      "/publications/actualites/discours-president-diomaye-conference-union-africaine-education-jeunesse",
    title:
      "Président Diomaye conférence de l’Union africaine dédiée à l’éducation",
    date: "2024-12-10",
    category: "Discours",
    image:
      "/images/actualites/discours-president-diomaye-conference-union-africaine-education-jeunesse.jpg",
  },
  {
    _path: "/conseil-des-ministres/conseil-des-ministres-du-03-decembre-2024",
    title: "Conseil des ministres du 03 decembre 2024",
    date: "2024-12-03",
    category: "Conseil des ministres",
    image: "/images/conseil-des-ministres-03-decembre-2024.PNG",
  },
  {
    _path: "/medias/liste-officielle",
    title: "Liste des 112 Médias reconnus au Sénégal",
    date: "2024-12-03",
    category: "Article",
    image: "/images/menu/medias-3.jpg",
  },
  {
    _path: "/publications/actualites/reamenagement-du-gouvernement-sonko",
    title: "Réaménagement du gouvernement",
    date: "2024-12-02",
    category: "Article",
    image:
      "/images/actualites/gouvernement-du-senegal-du-02-decembre-2024.webp",
  },
  {
    _path: "/publications/actualites/assemblee-nationale-2024",
    title: "Assemblé nationale, les membres du bureaux",
    date: "2024-12-02",
    category: "Article",
    image: "/images/actualites/assemblee-natinale-15em-legislature-bureau.png",
  },
  {
    _path: "/portraits/el-malick-ndiaye",
    title: "Nouveau président de l'assemblée nationale",
    date: "2024-12-02",
    category: "Article",
    image: "/gouvernement/ministre-malick-ndiaye.jpg",
  },
  {
    _path:
      "/publications/actualites/discours-president-diomaye-commemoration-80e-anniversaire-du-massacre-de-thiaroye",
    title: "80e anniversaire du Massacre de Thiaroye 1944",
    date: "2024-12-01",
    category: "Discours",
    image:
      "/images/actualites/president-diomaye-commemoration-80e-anniversaire-du-massacre-de-thiaroye-2.jpg",
  },
  {
    _path: "/publications/actualites/journee-nationale-daara-senegal-2024",
    title: "Journée nationale des daaras, discours du président Diomaye",
    date: "2024-11-28",
    category: "Discours",
    image: "/images/actualites/journee-nationale-daara-2024-senegal.jpeg",
  },
  {
    _path:
      "/publications/actualites/interview-president-diomaye-france-2-massacre-thiaroye",
    title:
      "Interview du président Diomaye à France 2 sur le massacre de Thioroye",
    date: "2024-11-28",
    category: "Article",
    image:
      "/images/actualites/interview-president-diomaye-france-2-massacre-thiaroye.jpg",
  },
  {
    _path:
      "/publications/actualites/accords-de-peche-conference-de-presse-fatou-diouf",
    title:
      "Accord de pêche avec l'UE, Point de presse de la ministre Dr Fatou Diouf",
    date: "2024-11-28",
    category: "Article",
    image:
      "/images/actualites/accords-de-peche-conference-de-presse-fatou-diouf.jpeg",
  },
  {
    _path: "/conseil-des-ministres/conseil-des-ministres-du-27-novembre-2024",
    title: "Conseil des ministres du 27 novembre 2024",
    date: "2024-11-27",
    category: "Conseil des ministres",
    image: "/images/communique-conseil-des-ministres-5.jpg",
  },
  // {
  //   _path:
  //     "/publications/actualites/conseil-interministeriel-sur-la-campagne-de-commercialisation-agricole-2024",
  //   title:
  //     "Conseil interministériel sur la campagne de commercialisation agricole 2024-2025",
  //   date: "2024-11-26",
  //   category: "Conseil interministériel",
  //   image:
  //     "/images/actualites/conseil-interministeriel-sur-la-campagne-de-commercialisation-agricole-2024.jpg",
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
          <!-- <div
            class="siteweb-type my-1 inline-block bg-gray-200 px-2 py-1 text-xs text-gray-800"
          >
            {{ item.category }}
          </div> -->

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
