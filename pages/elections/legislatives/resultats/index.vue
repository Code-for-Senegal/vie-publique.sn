<!-- pages/elections/legislatives/resultats/index.vue -->
<template>
  <div class="flex flex-col items-center px-4">
    <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Tableau de bord', to: '/elections' },
        { label: 'Résultats' },
      ]"
    />

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Résultats Législatives 2024</h1>
    </div>

    <UTabs v-model="activeTab" :items="tabs" class="w-full" :default-index="0">
      <template #item="{ item }">
        <!-- Projection -->
        <div v-if="item.key === 'projection'" class="w-full">
          <ElectionResultProjectionHemicycle :data="coalitionResults" />
          <!-- Statistiques supplémentaires -->
          <ElectionResultKPI />
          <div class="mb-6 mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            <!-- 3ème  bloc -->
            <ElectionMenuDepute class="mb-2" />

            <!-- 4ème  bloc -->
            <ElectionMenuClassement class="mb-2" />
          </div>
        </div>

        <!-- PV -->
        <div v-else-if="item.key === 'pv'" class="w-full">
          <div class="my-3 w-full text-center">
            <USelect
              v-model="entityType"
              :options="entityTypes"
              class="input custom-shadow mb-4 w-full"
            />
          </div>
          <ElectionResultPvGrid :source="entityType" />
        </div>

        <!-- Résultats -->
        <div v-else-if="item.key === 'map'" class="w-full">
          <ClientOnly>
            <Suspense>
              <ElectionMapComponentResult :legendes="coalitionResults" />
              <template #fallback>
                <div class="flex h-[600px] w-full items-center justify-center">
                  <div
                    class="h-20 w-20 animate-spin rounded-full border-8 border-gray-300 border-t-green-700"
                  ></div>
                </div>
              </template>
            </Suspense>
          </ClientOnly>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
// Meta tags
const seoTitle = "Résultats Élections Législatives 2024 Sénégal";
const seoDescription =
  "Résultats Élections Législatives anticipées du 17 Novembre 2024 Sénégal";
const seoImgPath = "/images/vpsn-share-elections.png";
const seoPageUrl = "https://vie-publique.sn/elections/legislatives";
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

// Tabs configuration
const activeTab = ref("projection");

// Tabs configuration
const tabs = [
  {
    key: "projection",
    label: "Hémicycle",
    icon: "i-heroicons-document-chart-bar",
  },
  {
    key: "pv",
    label: "PV",
    icon: "i-heroicons-document-chart-bar",
  },
  {
    key: "map",
    label: "Carte",
    icon: "i-heroicons-map",
  },
];

const entityTypeNational = "national";
const entityTypeDiaspora = "etranger";
const entityTypes = [
  { label: "Nationale", value: entityTypeNational },
  { label: "Diaspora", value: entityTypeDiaspora },
];

const entityType = ref<"national" | "etranger">(entityTypeNational);

const coalitionResults = [
  {
    coalition: "PASTEF",
    color: "#B13131",
    seats: 130,
    departementsWon: 40,
    seatMajority: 29,
    head_of_list: {
      photo_url:
        "https://cms.vie-publique.sn/assets/4e1c3427-ae2d-4090-a5fb-8460f7ef8ac3",
      full_name: "OUSMANE SONKO",
    },
  },
  {
    coalition: "TAKKU WALLU",
    color: "#5c5300",
    seats: 16,
    seatMajority: 8,
    departementsWon: 4,
    head_of_list: {
      photo_url:
        "https://cms.vie-publique.sn/assets/99371091-1155-4e66-95ca-b9ee21eb2320",
      full_name: "MACKY SALL",
    },
  },
  {
    coalition: "DIAM AK NJARIN",
    color: "#24C239",
    seats: 7,
    departementsWon: 1,
    seatMajority: 5,
    head_of_list: {
      photo_url:
        "https://cms.vie-publique.sn/assets/99371091-1155-4e66-95ca-b9ee21eb2320",
      full_name: "Amadou Ba",
    },
  },
  {
    coalition: "SAMM SA KAADU",
    color: "#e8d417",
    seats: 3,
    seatMajority: 3,
    departementsWon: null,
    head_of_list: {
      photo_url:
        "https://cms.vie-publique.sn/assets/aadfcb81-f15f-444f-9faf-120918647cd1",
      full_name: "BARTHELEMY TOYE DIAS",
    },
  },
  {
    coalition: "ANDU NAWLE",
    color: "#26B8F7",
    seats: 2,
    departementsWon: 1,
    head_of_list: null,
  },
  {
    coalition: "Nationalistes",
    color: "#6C6FD3",
    seats: 1,
    departementsWon: null,
    head_of_list: null,
  },
  {
    coalition: "Senegal Kesse",
    color: "#121270",
    seats: 1,
    departementsWon: null,
    head_of_list: null,
  },
  {
    coalition: "Sopi Senegal",
    color: "#F3F782",
    seats: 1,
    departementsWon: null,
    head_of_list: null,
  },
  {
    coalition: "Kiraay Ak Natangué",
    color: "#55B361",
    seats: 1,
    departementsWon: null,
    head_of_list: null,
  },
  {
    coalition: "AND CI KOOLUTE AKS",
    color: "#848040",
    seats: 1,
    departementsWon: null,
    head_of_list: null,
  },
  {
    coalition: "Farlu ",
    color: "#19BBE3",
    seats: 1,
    departementsWon: null,
    head_of_list: null,
  },
  {
    coalition: "AND BEESAL SENEGAL",
    color: "#FF8000",
    seats: 1,
    departementsWon: null,
    head_of_list: null,
  },
];
</script>
