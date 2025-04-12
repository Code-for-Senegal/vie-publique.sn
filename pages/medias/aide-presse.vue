<script setup lang="ts">
import type { AidePresse } from "~/types/aide-presse-type";

const seoTitle = "Aide à la presse Sénégal 2023";
const seoDescription =
  "Fonds d'appui et de développement de la presse (FADP), classement des titres de presse aidés en 2023 au Sénégal";
const seoImgPath = "/images/share-media.JPG";
const seoPageUrl = "https://vie-publique.sn/medias/aide";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
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
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

/* plugin */

const { $dateformat } = useNuxtApp();

/* Get Datas */

const nuxtApp = useNuxtApp();
const { data } = await useFetch("/api/aide-presse", {
  watch: false,

  transform(input) {
    return {
      aides: input,
      fetchedAt: new Date(),
    };
  },

  getCachedData(key) {
    const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    // If data is not fetched yet
    if (!data) {
      // Fetch the first time
      return;
    }

    // Is the data too old?
    const expirationDate = new Date(data.fetchedAt);
    expirationDate.setTime(expirationDate.getTime() + 120 * 1000); // 120 secondes
    const isExpired = expirationDate.getTime() < Date.now();
    if (isExpired) {
      // Refetch the data
      return;
    }

    return data;
  },
});

/* Filters */

const searchQuery = ref("");
const selectedType = ref("Chaîne TV");
const sortType = ref("amount"); // 'name' pour ordre alphabétique, 'amount' pour montant

const filteredAndSortedAides = computed(() => {
  const filtered =
    data.value.aides?.filter(
      (aide: AidePresse) =>
        aide.recipient_name
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase()) &&
        (!selectedType.value || aide.category === selectedType.value),
    ) || [];

  return filtered.sort((a, b) => {
    if (sortType.value === "amount") {
      return b.amount - a.amount;
    } else {
      return a.recipient_name.localeCompare(b.recipient_name);
    }
  });
});

/* Pagination */

const page = ref(1);
const pageCount = 50;

const rowsfilteredAides = computed(() => {
  return filteredAndSortedAides.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount,
  );
});

// FIXME move to server
const totalsByType = computed(() => {
  const totals: Record<string, number> = {};
  data.value.aides?.forEach((aide: AidePresse) => {
    if (aide.category) {
      if (!totals[aide.category]) {
        totals[aide.category] = 0;
      }
      totals[aide.category]++;
    }
  });

  // Convert object to array, sort alphabetically, then convert back to object
  return Object.fromEntries(
    Object.entries(totals).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)),
  );

  // return totals;
});

// Réinitialiser la page lors d'une recherche
watch(searchQuery, () => {
  selectedType.value = "";
  page.value = 1;
});
// Réinitialiser la page lors du changement de type
watch([selectedType, selectedType], () => {
  page.value = 1;
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Aides à la presse 2023</h1>
    </div>

    <div class="text-center">
      <p v-if="rowsfilteredAides.length > 1" class="mb-2 text-sm text-gray-500">
        Fonds d'appui et de développement de la presse
      </p>
    </div>

    <div class="w-full max-w-4xl">
      <UInput
        v-model="searchQuery"
        class="input custom-shadow mb-3 w-full"
        size="lg"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher un media..."
      >
      </UInput>

      <div class="mb-1 w-full text-center">
        <UButton
          v-for="(total, type) in totalsByType"
          :key="type"
          :ui="{ rounded: 'rounded-full' }"
          :color="selectedType === type ? 'primary' : 'white'"
          class="custom-shadow mb-1 ml-1 text-sm font-normal"
          size="sm"
          @click="selectedType = selectedType === type ? '' : type"
        >
          {{ type }}
          <UBadge
            :ui="{ rounded: 'rounded-full' }"
            :label="total"
            color="primary"
            :variant="selectedType === type ? 'soft' : 'solid'"
            size="xs"
          ></UBadge>
        </UButton>
      </div>

      <!-- Nouvelles options de tri -->
      <div class="fle xflex-row mb-4 text-center text-sm">
        <span class="mr-2 text-gray-600">Trier par :</span>
        <a
          href="#"
          :class="{ 'text-black underline': sortType === 'name' }"
          class="text-gray-500"
          @click.prevent="sortType = 'name'"
          >Nom</a
        >
        |
        <a
          href="#"
          :class="{ 'text-black underline': sortType === 'amount' }"
          class="text-gray-500"
          @click.prevent="sortType = 'amount'"
        >
          > Montant
        </a>
      </div>

      <!-- <div class="space-y-2"> -->
      <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="press in rowsfilteredAides"
          :key="press.recipient_name"
          class="custom-shadow cursor-pointer"
        >
          <div class="flex flex-row gap-2">
            <div class="h-16 w-16 flex-shrink-0">
              <NuxtImg
                :src="press.photo || '/default-image-2.gif'"
                alt="Photo ministre"
                sizes="40px"
                class="h-full w-full rounded-full object-cover"
                loading="lazy"
                fetchpriority="high"
                placeholder
              />
            </div>
            <div class="flex-grow">
              <h2 class="text-sm font-semibold">{{ press.recipient_name }}</h2>
              <p class="">{{ $formatAmount(press.amount) }} FCFA</p>
              <p class="text-sm text-gray-500">
                {{ press.category }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <div
        :class="{ hidden: rowsfilteredAides < pageCount }"
        class="flex justify-end border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
        <UPagination
          v-model="page"
          size="md"
          :page-count="pageCount"
          :total="filteredAndSortedAides.length"
        />
      </div>
    </div>
  </div>
</template>
