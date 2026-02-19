<template>
  <div class="min-h-screen p-4 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'Dashboard' },
        { label: 'Conseil des Ministres' }
      ]"
    />

    <h1 class="mb-4 text-2xl font-bold">Décisions du Conseil des Ministres</h1>

    <!-- Filtres -->
    <div class="mb-6 flex flex-wrap gap-4">
      <div class="min-w-[200px] flex-1">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-white"
          >Filtrer par statut</label
        >
        <select
          v-model="filters.status"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="inactive">Inactif</option>
        </select>
      </div>
      <div class="min-w-[200px] flex-1">
        <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-white"
          >Filtrer par type</label
        >
        <select
          v-model="filters.type"
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Tous les types</option>
          <option v-for="type in uniqueTypes" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
      </div>
    </div>

    <!-- Tableau des décisions -->
    <div class="overflow-x-auto rounded-lg bg-white shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr class="bg-gray-50">
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Titre
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Type
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Statut
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr
            v-for="decision in filteredDecisions"
            :key="decision.id"
            class="transition-colors hover:bg-gray-50"
          >
            <td class="whitespace-nowrap px-6 py-4">
              <div class="text-sm font-medium text-gray-900">
                {{ decision.title }}
              </div>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span
                :class="{
                  'rounded-full px-3 py-1 text-xs font-medium': true,
                  'bg-purple-100 text-purple-800': decision.type === 'Décret',
                  'bg-blue-100 text-blue-800': decision.type === 'Arrêté',
                  'bg-indigo-100 text-indigo-800': decision.type === 'Décision',
                  'bg-gray-100 text-gray-800': ![
                    'Décret',
                    'Arrêté',
                    'Décision',
                  ].includes(decision.type),
                }"
              >
                {{ decision.type }}
              </span>
            </td>
            <td class="whitespace-nowrap px-6 py-4">
              <span
                :class="{
                  'rounded-full px-3 py-1 text-xs font-medium': true,
                  'bg-green-100 text-green-800': decision.status === 'active',
                  'bg-yellow-100 text-yellow-800':
                    decision.status === 'pending',
                  'bg-red-100 text-red-800': decision.status === 'inactive',
                }"
              >
                {{ getStatusLabel(decision.status) }}
              </span>
            </td>
            <td
              class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"
            >
              <button
                class="rounded-md bg-blue-50 px-3 py-1 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-900"
                @click="openModal(decision)"
              >
                Voir détails
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour les détails -->
    <div
      v-if="selectedDecision"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">
            {{ selectedDecision.title }}
          </h2>
          <button
            class="text-gray-500 transition-colors hover:text-gray-700"
            @click="closeModal"
          >
            <span class="text-2xl">&times;</span>
          </button>
        </div>
        <div class="space-y-4">
          <div class="rounded-lg bg-gray-50 p-4">
            <h3 class="mb-2 font-semibold text-gray-900">Description</h3>
            <p class="text-gray-700">{{ selectedDecision.description }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-2 font-semibold text-gray-900">
                Ministère concerné
              </h3>
              <p class="text-gray-700">{{ selectedDecision.ministry }}</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-2 font-semibold text-gray-900">Type</h3>
              <span
                :class="{
                  'rounded-full px-3 py-1 text-xs font-medium': true,
                  'bg-purple-100 text-purple-800':
                    selectedDecision.type === 'Décret',
                  'bg-blue-100 text-blue-800':
                    selectedDecision.type === 'Arrêté',
                  'bg-indigo-100 text-indigo-800':
                    selectedDecision.type === 'Décision',
                  'bg-gray-100 text-gray-800': ![
                    'Décret',
                    'Arrêté',
                    'Décision',
                  ].includes(selectedDecision.type),
                }"
              >
                {{ selectedDecision.type }}
              </span>
            </div>
            <div class="rounded-lg bg-gray-50 p-4">
              <h3 class="mb-2 font-semibold text-gray-900">Statut</h3>
              <span
                :class="{
                  'rounded-full px-3 py-1 text-xs font-medium': true,
                  'bg-green-100 text-green-800':
                    selectedDecision.status === 'active',
                  'bg-yellow-100 text-yellow-800':
                    selectedDecision.status === 'pending',
                  'bg-red-100 text-red-800':
                    selectedDecision.status === 'inactive',
                }"
              >
                {{ getStatusLabel(selectedDecision.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { data } = useFetch("/api/councyl-minister");
const selectedDecision = ref(null);
const filters = ref({
  status: "",
  type: "",
});

// Calculer les types uniques pour le filtre
const uniqueTypes = computed(() => {
  if (!data.value?.data) return [];
  return [...new Set(data.value.data.map((item) => item.type))];
});

// Filtrer les décisions
const filteredDecisions = computed(() => {
  if (!data.value?.data) return [];

  return data.value.data.filter((decision) => {
    const statusMatch =
      !filters.value.status || decision.status === filters.value.status;
    const typeMatch =
      !filters.value.type || decision.type === filters.value.type;
    return statusMatch && typeMatch;
  });
});

// Fonction pour obtenir le libellé du statut
const getStatusLabel = (status) => {
  const labels = {
    active: "Actif",
    pending: "En attente",
    inactive: "Inactif",
  };
  return labels[status] || status;
};

const openModal = (decision) => {
  selectedDecision.value = decision;
};

const closeModal = () => {
  selectedDecision.value = null;
};
</script>
