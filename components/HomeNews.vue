<script lang="ts" setup>
const starNews = [
  {
    _path: "/budget-senegal",
    title: "Suivi du Budget du Sénégal",
    date: "2024-09-05",
    category: "Tableau de bord",
    image: "/images/actualites/budget-2024.PNG",
  },
  {
    _path: "/publications/actualites/discours-president-diomaye-focac",
    title: "Discours du président Diomaye au sommet du forum Sino-Africain",
    date: "2024-09-05",
    category: "Discours",
    image: "/images/actualites/diomaye-chine-focac-1.jpeg",
  },
  {
    _path:
      "/publications/actualites/reunion-interministerielle-sur-leconomie-denergie",
    title: "Réunion interministérielle sur l'économie d'énergie",
    date: "2024-08-30",
    category: "Conseil interministériel",
    image:
      "/images/actualites/reunion-interministerielle-sur-leconomie-denergie.jpeg",
  },
  {
    _path: "/conseil-des-ministres/conseil-des-ministres-du-28-aout-2024",
    title: "Conseil des ministres du Mercredi 28 août 2024",
    date: "2024-08-28",
    category: "Conseil des ministres",
    image: "/images/communique-conseil-des-ministres.jpeg",
  },
];
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <p class="font-semibold">
            {{ item.title }}
          </p>
          <div class="text-sm text-gray-800">
            {{ $dateformatWithDayName(item.date) }}
          </div>
        </div>
      </NuxtLink>
    </UCard>
  </div>
</template>
