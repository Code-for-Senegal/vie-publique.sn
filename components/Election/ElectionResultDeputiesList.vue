<!-- components/DeputiesList.vue -->
<template>
  <div class="container mx-auto px-4 py-4">
    <!-- État de chargement -->
    <div v-if="loading" class="flex min-h-[200px] items-center justify-center">
      <UProgress />
    </div>

    <!-- Message d'erreur -->
    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      icon="i-heroicons-exclamation-triangle"
      class="mb-4"
    >
      {{ error }}
    </UAlert>

    <!-- Grid des députés -->
    <template v-if="!loading && !error && deputies.length > 0">
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        <div
          v-for="deputy in deputies"
          :key="deputy.id"
          @click="openModal(deputy)"
          class="cursor-pointer rounded-lg bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-lg"
        >
          <div class="flex flex-col items-center">
            <UAvatar
              :src="
                deputy.photo
                  ? `https://cms.vie-publique.sn/assets/${deputy.photo}`
                  : ''
              "
              :alt="`Photo de ${deputy.first_name} ${deputy.last_name}`"
              size="lg"
              class="mb-3"
            />
            <h3 class="text-center font-semibold">
              {{ deputy.first_name }} {{ deputy.last_name }}
            </h3>
            <p class="mt-1 text-center text-sm text-gray-600">
              {{ deputy.profession }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <!-- Message si aucun député -->
    <div v-else-if="!loading && !error" class="py-8 text-center text-gray-500">
      Aucun député trouvé
    </div>

    <!-- Modal de détails -->
    <UModal v-model="isModalOpen">
      <UCard v-if="selectedDeputy">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">Détails du député</h3>
            <UButton
              icon="i-heroicons-x-mark"
              color="gray"
              variant="ghost"
              @click="closeModal"
            />
          </div>
        </template>

        <div class="flex flex-col gap-6 md:flex-row">
          <div class="flex-shrink-0">
            <UAvatar
              :src="
                selectedDeputy.photo
                  ? `https://cms.vie-publique.sn/assets/${selectedDeputy.photo}`
                  : ''
              "
              :alt="`Photo de ${selectedDeputy.first_name} ${selectedDeputy.last_name}`"
              size="2xl"
            />
          </div>

          <div class="flex-grow">
            <div class="space-y-4">
              <div>
                <h4 class="text-sm text-gray-500">Nom complet</h4>
                <p class="font-medium">
                  {{ selectedDeputy.first_name }} {{ selectedDeputy.last_name }}
                </p>
              </div>

              <div>
                <h4 class="text-sm text-gray-500">Profession</h4>
                <p class="font-medium">{{ selectedDeputy.profession }}</p>
              </div>

              <div>
                <h4 class="text-sm text-gray-500">Liste électorale</h4>
                <p class="font-medium">
                  {{ selectedDeputy.electoral_list?.name }}
                </p>
                <UBadge color="primary" class="mt-1">{{
                  selectedDeputy.electoral_list?.type
                }}</UBadge>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end">
            <UButton color="gray" @click="closeModal">Fermer</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const isModalOpen = ref(false);
const selectedDeputy = ref(null);

// Récupération des données via le composable
const { deputies, loading, error } = useDeputies();

const openModal = (deputy) => {
  selectedDeputy.value = deputy;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedDeputy.value = null;
};
</script>
