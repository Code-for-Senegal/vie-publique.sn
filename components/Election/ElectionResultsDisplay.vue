<!-- // components/elections/ElectionHemicycleChart.vue -->
<!-- // components/elections/ResultsDisplay.vue -->
<template>
  <div class="mx-auto w-full max-w-7xl p-4">
    <!-- En-tête -->
    <UCard class="custom-shadow mb-2">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Législatives Sénégal 2024</h1>
          <div class="mt-4 grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold">
                {{ stats.totalSeats }}
              </div>
              <div class="text-sm text-gray-500">Sièges à pourvoir</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold">{{ stats.seatProvided }}</div>
              <div class="text-sm text-gray-500">Sièges pourvus</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold">
                {{ stats.participationRate }}%
              </div>
              <div class="text-sm text-gray-500">Taux de Participation</div>
            </div>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Tabs -->
    <UTabs :items="tabs" class="w-full">
      <template #item="{ item }">
        <div v-if="item.id === 'national'" class="w-full">
          <!-- <ElectionResultProjectionHemicycle :data="coalitionResults" /> -->
        </div>
        <div v-if="item.id === 'hemicycle'" class="w-full">
          <ElectionResultProjectionHemicycle :data="coalitionResults" />
        </div>
        <div v-if="item.id === 'histogram'" class="w-full">
          <ElectionResultProjectionHistogram :data="coalitionResults" />
        </div>
      </template>
      <!-- Autres onglets... -->
    </UTabs>
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { id: "hemicycle", label: "Hémicycle", icon: "i-heroicons-chart-pie" },
  // { id: "national", label: "Nationale", icon: "i-heroicons-chart-pie" },
  // { id: "map", label: "Carte", icon: "i-heroicons-map" },
  // { id: "departments", label: "Départements", icon: "i-heroicons-chart-bar" },
  { id: "histogram", label: "histogram", icon: "i-heroicons-document-text" },
];

const stats = ref({
  seatProvided: 165,
  totalSeats: 165,
  participationRate: 47,
});

const coalitionResults = [
  {
    coalition: "PASTEF",
    color: "#B13131",
    seats: 130,
    head_of_list: {
      photo_url:
        "https://cms.vie-publique.sn/assets/4e1c3427-ae2d-4090-a5fb-8460f7ef8ac3",
      full_name: "OUSMANE SONKO",
    },
  },
  {
    coalition: "SAMM SA KAADU",
    color: "#e8d417",
    seats: 3,
    head_of_list: {
      photo_url:
        "https://cms.vie-publique.sn/assets/aadfcb81-f15f-444f-9faf-120918647cd1",
      full_name: "BARTHELEMY TOYE DIAS",
    },
  },
  {
    coalition: "TAKKU WALLU",
    color: "#5c5300",
    seats: 16,
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
    head_of_list: {
      photo_url:
        "https://cms.vie-publique.sn/assets/99371091-1155-4e66-95ca-b9ee21eb2320",
      full_name: "Amadou Ba",
    },
  },
  {
    coalition: "Nationalistes",
    color: "#6C6FD3",
    seats: 1,
    head_of_list: null,
  },
  {
    coalition: "Senegal Kesse",
    color: "#121270",
    seats: 1,
    head_of_list: null,
  },
  {
    coalition: "Sopi Senegal",
    color: "#F3F782",
    seats: 1,
    head_of_list: null,
  },
  {
    coalition: "Natangue",
    color: "#55B361",
    seats: 1,
    head_of_list: null,
  },
  {
    coalition: "Bes du niakk",
    color: "#FF8000",
    seats: 1,
    head_of_list: null,
  },
  {
    coalition: "And Besal Senegal",
    color: "#F7F24D",
    seats: 1,
    head_of_list: null,
  },
  {
    coalition: "ANDU NAWLE",
    color: "#26B8F7",
    seats: 2,
    head_of_list: null,
  },
];
</script>
