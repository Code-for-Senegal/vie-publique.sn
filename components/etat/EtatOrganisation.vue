<script setup lang="ts">
const tabs = [
  {
    key: "list",
    label: "Liste",
    description: "Liste des entités de l'État du Sénégal",
  },
  {
    key: "tree",
    label: "Arborescence",
    description: "Arborescence des entités de l'État du Sénégal",
  },
];

/* Get Datas */

const nuxtApp = useNuxtApp();
const { data } = await useFetch("/api/etat-organisation", {
  watch: false,

  transform(input) {
    return {
      flatData: input.flatData,
      brutData: input.brutData,
      fetchedAt: new Date(),
    };
  },

  getCachedData(key) {
    const data = nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    if (!data) {
      return;
    }

    const expirationDate = new Date(data.fetchedAt);
    expirationDate.setTime(expirationDate.getTime() + 120 * 1000); // 120 secondes
    const isExpired = expirationDate.getTime() < Date.now();
    if (isExpired) {
      return;
    }

    return data;
  },
});

/* Filters */

const searchTerm = ref("");
const entityType = ref("Établissement public");

// const entityTypes = [
//   { label: "Tous les types", value: "" },
//   { label: "Ministère", value: "Ministère" },
//   { label: "Direction", value: "Direction" },
//   { label: "Service", value: "Service" },
//   { label: "Établissement public", value: "Établissement public" },
//   { label: "Société nationale", value: "Société nationale" },
// ];

const entityTypes = [
  { label: "Établissement public", value: "Établissement public" },
  { label: "Société nationale", value: "Société nationale" },
];

const filteredEntities = computed(() => {
  console.log(data.value);
  return data.value.flatData?.filter(
    (entity) =>
      entity.name.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
      (entityType.value === "" || entity.type === entityType.value),
  );
});
</script>

<template>
  <div>
    <!-- <UTabs :items="items" :default-index="1" /> -->

    <!-- <h1>TEST</h1> -->
    <UTabs :items="tabs" class="w-full">
      <template #item="{ item }">
        <!-- <div v-if="selected"> -->
        <div v-if="item.key === 'list'" class="w-full">
          <UInput
            v-model="searchTerm"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher une entité..."
            class="input custom-shadow mb-1 w-full"
            size="md"
          />
          <USelect
            v-model="entityType"
            :options="entityTypes"
            placeholder="Tous les types"
            class="input custom-shadow mb-4 w-full"
          />

          <!-- <pre>Nombre: {{ filteredEntities.length }} </pre> -->
          <div class="text-semibold mb-2 text-sm">
            Total: {{ filteredEntities.length }}
          </div>

          <div class="flex flex-col gap-2">
            <UCard
              v-for="entity in filteredEntities"
              :key="entity.name"
              class="custom-shadow cursor-pointer"
            >
              <!-- <template #header> </template> -->
              <!-- <p class="text-sm text-gray-600">{{ entity.type }}</p> -->
              <!-- <p class="text-sm text-gray-600">{{ entity.parent }}</p> -->
              <h3 class="font-bold">{{ entity.name }}</h3>
              <div class="mt-2 flex flex-col gap-2 sm:flex-row">
                <span
                  v-for="(parent, index) in entity.parents.slice(1)"
                  :key="index"
                  class="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-700"
                >
                  {{ parent }}
                </span>
              </div>
            </UCard>
          </div>
        </div>
        <div v-else-if="item.key === 'tree'" class="w-full">
          <EtatTreeView :data="data.brutData" />
        </div>
        <!-- </div> -->
      </template>
    </UTabs>
  </div>
</template>
