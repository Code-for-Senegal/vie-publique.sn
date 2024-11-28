<!-- components/ParticipationDashboard.vue -->
<script setup lang="ts">
import { ref, computed } from "vue";
import type { DepartmentData } from "~/types/election-participation";

const searchTerm = ref("");
const departments = ref<DepartmentData[]>([]);
const lastUpdate = ref("");

// Charger les données depuis votre API
const loadData = async () => {
  try {
    const response = await fetch(
      "https://cms.vie-publique.sn/items/carte?fields=*",
    );
    const data = await response.json();
    departments.value = data.data;
    lastUpdate.value = new Date().toLocaleTimeString();
  } catch (error) {
    console.error("Erreur de chargement:", error);
  }
};

// Calculer les taux globaux
const globalRates = computed(() => {
  // const total = departments.value.length;
  return {
    "10h": null,
    "12h": null,
    "14h": 35,
    "17h": null,
  };
});

// const calculateAverageRate = (field: keyof DepartmentData) => {
//   const validDepts = departments.value.filter((d) => d[field] != null);
//   if (!validDepts.length) return null;
//   const sum = validDepts.reduce(
//     (acc, curr) => acc + (curr[field] as number),
//     0,
//   );
//   return (sum / validDepts.length).toFixed(1);
// };

// Filtrer les départements
const filteredDepartments = computed(() => {
  return departments.value.filter(
    (dept) =>
      dept.departement.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      dept.region.toLowerCase().includes(searchTerm.value.toLowerCase()),
  );
});

// Charger les données au montage
onMounted(() => {
  loadData();
  // Optionnel: Rafraîchir toutes les 5 minutes
  setInterval(loadData, 300000);
});
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 p-4">
    <!-- En-tête -->
    <UCard class="bg-blue-50">
      <h1 class="text-2xl font-bold text-blue-900">
        Taux de Participation Législatives 2024
      </h1>
      <p class="text-gray-700">Dernière mise à jour : {{ lastUpdate }}</p>
    </UCard>

    <!-- Taux globaux -->
    <div class="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-4">
      <UCard
        v-for="(rate, hour) in globalRates"
        :key="hour"
        class="custom-shadow px-0 py-0 text-center"
      >
        <h3 class="font-semibold sm:text-xl">Taux à {{ hour }}</h3>
        <p class="font-bold text-blue-900 sm:text-3xl">
          {{ rate ? `${rate}%` : "-" }}
          -
        </p>
      </UCard>
    </div>

    <!-- Recherche -->
    <UInput
      v-model="searchTerm"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher un département..."
    />

    <!-- Tableau -->
    <!-- Container du tableau avec en-tête fixe -->
    <div class="relative">
      <!-- En-tête fixe -->
      <div class="sticky top-0 z-10 border-b bg-white">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="text-left font-semibold">Département</th>
              <th class="text-right font-semibold">Inscrits</th>
              <th class="whitespace-nowrap p-4 text-right font-semibold">
                10h
              </th>
              <th class="whitespace-nowrap p-4 text-right font-semibold">
                12h
              </th>
              <th class="whitespace-nowrap p-4 text-right font-semibold">
                14h
              </th>
              <th class="whitespace-nowrap p-4 text-right font-semibold">
                17h
              </th>
            </tr>
          </thead>
        </table>
      </div>
      <!-- Corps du tableau scrollable -->
      <div class="max-h-96 overflow-y-auto">
        <table class="w-full">
          <tbody class="divide-y">
            <tr
              v-for="dept in filteredDepartments"
              :key="dept.departement"
              class="hover:bg-gray-50"
            >
              <td class="p-2">
                <p class="font-medium">{{ dept.departement }}</p>
                <p class="text-sm text-gray-600">{{ dept.region }}</p>
              </td>
              <td class="p-2">
                {{ dept.voters.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap p-4">
                {{
                  dept.participation_10h ? `${dept.participation_10h}%` : "-"
                }}
              </td>
              <td class="whitespace-nowrap p-4 text-right">
                {{
                  dept.participation_12h ? `${dept.participation_12h}%` : "-"
                }}
              </td>
              <td class="whitespace-nowrap p-4 text-right">
                {{
                  dept.participation_14h ? `${dept.participation_14h}%` : "-"
                }}
              </td>
              <td class="whitespace-nowrap p-4 text-right">
                {{
                  dept.participation_17h ? `${dept.participation_17h}%` : "-"
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- <UTable
      :rows="filteredDepartments"
      :columns="[
        { key: 'departement', label: 'Département' },
        { key: 'voters', label: 'Inscrits' },
        { key: 'participation_10h', label: '10h' },
        { key: 'participation_12h', label: '12h' },
        { key: 'participation_17h', label: '17h' },
      ]"
    >
      <template #departement-data="{ row }">
        <p>{{ row.departement }}</p>
        <p class="text-sm text-gray-600">{{ row.region }}</p>
      </template>
      <template #participation_10h-data="{ row }">
        {{ row.participation_10h ? `${row.participation_10h}%` : "-" }}
      </template>
      <template #participation_12h-data="{ row }">
        {{ row.participation_12h ? `${row.participation_12h}%` : "-" }}
      </template>
      <template #participation_17h-data="{ row }">
        {{ row.participation_17h ? `${row.participation_17h}%` : "-" }}
      </template>
    </UTable> -->
  </div>
</template>
