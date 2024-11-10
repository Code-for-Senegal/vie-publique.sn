<script lang="ts" setup>
const starNews = [
  {
    _path: "/conseil-des-ministres/conseil-des-ministres-du-06-novembre-2024",
    title: "Conseil des ministres du 06 novembre 2024",
    date: "2024-11-06",
    category: "Conseil des ministres",
    image: "/images/conseil-des-ministres-du-06-novembre-2024.png",
  },
  {
    _path:
      "/publications/actualites/president-diomaye-visite-etat-senegal-turquie",
    title: "Président Diomaye en visite d'État en Turquie",
    date: "2024-10-31",
    category: "Discours",
    image: "/images/actualites/pr-diomaye-turquie-1.webp",
  },
  {
    _path:
      "/publications/actualites/interview-president-diomaye-forum-fii-2024-riyad",
    title:
      "Interview du président Diomaye au Forum Future Investment Initiative À Riyad",
    date: "2024-10-28",
    category: "Discours",
    image:
      "/images/actualites/interview-president-diomaye-forum-fii-2024-riyad.jpg",
  },
  {
    _path: "/conseil-des-ministres/conseil-des-ministres-du-23-octobre-2024",
    title: "Conseil des ministres du 23 octobre 2024",
    date: "2024-10-23",
    category: "Conseil des ministres",
    image: "/images/diomaye-faye-2.jpeg",
  },
  {
    _path: "/conseil-des-ministres/conseil-des-ministres-du-16-octobre-2024",
    title: "Conseil des ministres du 16 octobre 2024",
    date: "2024-10-16",
    category: "Conseil des ministres",
    image: "/images/actualites/conseil-des-ministres-du-16-octobre-2024.png",
  },
  {
    _path: "/publications/actualites/senegal-2050-lancement",
    title: "Lancement du référentiel « SÉNÉGAL 2050 »",
    date: "2024-10-14",
    category: "Article",
    image: "/images/actualites/senegal-2050-lancement-1.PNG",
  },
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
