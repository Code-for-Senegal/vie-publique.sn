<script setup lang="ts">
// import ElectionLeaflet from "~/components/Election/ElectionLeaflet.vue";

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const { regions, loading, error, fetchRegions } = useRegionsData();

const optionMap = "map";
const optionMap2 = "map2";
const optionList = "list";
const senegalMap = "SenegalMap";
const senegalMapGenerator = "SenegalMapGenerator";
const selectedOptions = ref(optionMap);

const items = [
  [
    {
      label: "Carte Base",
      icon: "i-heroicons-map-solid",
      click: () => {
        console.log("Carte");
        selectedOptions.value = optionMap;
      },
    },
  ],
  [
    {
      label: "Carte choroplèthe",
      icon: "i-heroicons-map-solid",
      click: () => {
        console.log("Carte");
        selectedOptions.value = optionMap2;
      },
    },
  ],
  [
    {
      label: "Liste",
      icon: "i-heroicons-list-bullet-solid",
      click: () => {
        console.log("Liste");
        selectedOptions.value = optionList;
      },
    },
  ],
  [
    {
      label: "SenegalMap",
      icon: "i-heroicons-list-bullet-solid",
      click: () => {
        console.log("SenegalMap");
        selectedOptions.value = senegalMap;
      },
    },
  ],
  [
    {
      label: "senegalMapGenerator",
      icon: "i-heroicons-list-bullet-solid",
      click: () => {
        console.log("senegalMapGenerator");
        selectedOptions.value = senegalMapGenerator;
      },
    },
  ],
];

const itemsSelect = [
  {
    label: "Carte Base",
    icon: "i-heroicons-map-solid",
    click: () => {
      console.log("Carte");
      selectedOptions.value = optionMap;
    },
  },

  {
    label: "Carte choroplèthe",
    icon: "i-heroicons-map-solid",
    click: () => {
      console.log("Carte");
      selectedOptions.value = optionMap2;
    },
  },

  {
    label: "Liste",
    icon: "i-heroicons-list-bullet-solid",
    click: () => {
      console.log("Liste");
      selectedOptions.value = optionList;
    },
  },
];

const retryLoading = async () => {
  await fetchRegions();
};

// Configuration initiale
onMounted(async () => {
  try {
    await fetchRegions();
  } catch (e) {
    console.error("Erreur lors du montage de la carte:", e);
  }
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Carte électorale 2024</h1>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
    >
      <USpinner />
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      type="error"
      :title="error.message"
      class="absolute right-4 top-4 z-50"
    >
      <template #description>
        <p v-if="error.details">{{ JSON.stringify(error.details) }}</p>
        <UButton
          class="mt-2"
          icon="i-heroicons-arrow-path"
          label="Réessayer"
          @click="retryLoading"
        />
      </template>
    </UAlert>

    <!-- FILTER OPTIONS -->

    <UDropdown
      :items="items"
      :popper="{ placement: 'bottom-start' }"
      class="custom-shadow my-2"
    >
      <UButton
        color="white"
        :label="selectedOptions"
        trailing-icon="i-heroicons-chevron-down-20-solid"
      />
    </UDropdown>

    <!-- <USelectMenu v-model="selectedOptions" :options="itemsSelect">
      <template #leading>
        <UIcon
          v-if="selectedOptions.icon"
          :name="selectedOptions.icon as string"
          class="h-5 w-5"
        />
      </template>
    </USelectMenu> -->

    <!-- CARTE 1 -->
    <ElectionMapComponent
      v-if="selectedOptions == optionMap"
      :initial-zoom="7"
      :regions="regions"
      :loading="loading"
    />

    <!-- CARTE 2 -->
    <ElectionMapChoropleteComponent
      v-else-if="selectedOptions == optionMap2"
      :regions="regions"
      :loading="loading"
    />

    <!-- CARTE 3 -->
    <div
      class="container mx-auto px-4 py-8"
      v-if="selectedOptions == senegalMap"
    >
      <ElectionSenegalMap />
    </div>

    <!-- CARTE 3 -->
    <div
      class="container mx-auto px-4 py-8"
      v-if="selectedOptions == senegalMapGenerator"
    >
      <h1 class="mb-6 text-3xl font-bold">SenegalMapGenerator du Sénégal</h1>
      <ElectionSenegalMapGenerator />
    </div>

    <!-- LISTE -->
    <div
      v-if="selectedOptions == optionList"
      class="flex w-full flex-col gap-2"
    >
      <UCard v-for="item in regions" :key="item.id" class="custom-shadow 0">
        <p>{{ item.departement }}</p>
        <p class="text-sm text-gray-600">{{ item.region }}</p>
        <!-- <UDivider class="pt-1" /> -->
      </UCard>
    </div>
  </div>
</template>
