<script setup lang="ts">
useHead({
  title: "Rapports public Sénégal OFNAC Cours des compte... | Vie-Publique.sn",
  meta: [
    {
      name: "description",
      content:
        "Rapports publics du Sénégal. CENTIF, OFNAC, ARMP, IGE, Cours des Comptes",
    },
  ],
});

const rapports = ref<any[]>([]);
const searchQuery = ref("");
const selectedOrganisme = ref("");
const selectedYear = ref("");

const organismes = ["Cours des Comptes", "OFNAC", "CENTIF", "IGE", "ARMP"];

const filteredRapports = computed(() =>
  rapports.value.filter((rapport) => {
    return (
      (searchQuery.value.length === 0 ||
        rapport.titre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        rapport.sous_titre
          .toLowerCase()
          .includes(searchQuery.value.toLowerCase())) &&
      (selectedOrganisme.value === "" ||
        rapport.organisme === selectedOrganisme.value) &&
      (selectedYear.value === "" ||
        rapport.annee === parseInt(selectedYear.value))
    );
  }),
);

onMounted(async () => {
  rapports.value = (
    await import("@/assets/data/rapport/rapports-liste.json")
  ).default.sort(
    (a, b) =>
      new Date(b.date_publication).getTime() -
      new Date(a.date_publication).getTime(),
  );
});

/* Pagination */

const page = ref(1);
const pageCount = 20;

const rowsfilteredRapports = computed(() => {
  return filteredRapports.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount,
  );
});

// Réinitialiser la page lors du changement de type
watch(selectedOrganisme, () => {
  page.value = 1;
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <h1 class="sr-only">
      Rapports d'audits publics Sénégal OFNAC Cour des comptes IGE CENTIF
    </h1>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">Rapports publics</h1>
    </div>
    <p v-if="rapports.length > 1" class="mb-4 text-sm text-gray-500">
      {{ rapports.length }} rapports disponibles
    </p>

    <UInput
      v-model="searchQuery"
      size="md"
      placeholder="Rechercher..."
      icon="i-heroicons-magnifying-glass"
      class="input custom-shadow mb-1 w-full"
    />

    <div class="my-3 w-full text-center">
      <UButton
        class="custom-shadow mb-1 ml-1"
        :color="selectedOrganisme === '' ? 'primary' : 'white'"
        @click="selectedOrganisme = ''"
      >
        Tous
      </UButton>
      <UButton
        v-for="organisme in organismes"
        :key="organisme"
        class="custom-shadow mb-1 ml-1"
        :color="selectedOrganisme === organisme ? 'primary' : 'white'"
        @click="
          selectedOrganisme = selectedOrganisme === organisme ? '' : organisme
        "
      >
        {{ organisme }}
      </UButton>
    </div>

    <div class="flex flex-col gap-2">
      <!-- Afficher USkeleton si les rapports ne sont pas encore chargés -->
      <div v-if="filteredRapports.length == 0">
        <div v-for="i in 5" :key="`skeleton-${i}`">
          <USkeleton class="custom-shadow mb-2 h-24 w-full bg-white" />
        </div>
      </div>

      <!-- Afficher les cartes de rapport une fois chargées -->
      <UCard
        v-for="rapport in rowsfilteredRapports"
        v-else
        :key="rapport.id"
        class="custom-shadow cursor-pointer"
      >
        <NuxtLink
          :to="`/rapport-senegal/${rapport.slug}`"
          class="flex flex-row gap-2"
        >
          <div class="w-12 flex-shrink-0 md:w-16">
            <img
              v-if="rapport.organisme == 'ARMP'"
              src="~/assets/logos/armp.webp"
              loading="lazy"
              fetchpriority="high"
              alt="Logo ARMP"
              class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
              width="60"
              height="40"
            />
            <img
              v-if="rapport.organisme == 'OFNAC'"
              src="~/assets/logos/ofnac.webp"
              loading="lazy"
              fetchpriority="high"
              alt="Logo OFNAC"
              class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
              width="60"
              height="40"
            />
            <img
              v-if="rapport.organisme == 'IGE'"
              src="~/assets/logos/ige.webp"
              loading="lazy"
              fetchpriority="high"
              alt="Logo IGE"
              class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
              width="60"
              height="40"
            />
            <img
              v-if="rapport.organisme == 'Cours des Comptes'"
              src="~/assets/logos/cour_des_comptes.webp"
              loading="lazy"
              fetchpriority="high"
              alt="Logo Cours des Comptes"
              class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
              width="60"
              height="40"
            />
            <img
              v-if="rapport.organisme == 'CENTIF'"
              src="~/assets/logos/centif.webp"
              loading="lazy"
              fetchpriority="high"
              alt="Logo CENTIF"
              class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
              width="60"
              height="40"
            />
            <img
              v-if="rapport.organisme == 'Autres'"
              src="~/assets/logos/doc.svg"
              loading="lazy"
              fetchpriority="high"
              alt="Logo rapport"
              class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
              width="60"
              height="40"
            />
          </div>

          <div class="flex-grow">
            <p class="text-sm font-semibold">{{ rapport.titre }}</p>
            <p class="text-sm text-gray-500">{{ rapport.sous_titre }}</p>
          </div>
        </NuxtLink>
      </UCard>
    </div>

    <div
      class="flex justify-end border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
    >
      <UPagination
        v-model="page"
        size="md"
        :page-count="pageCount"
        :total="filteredRapports.length"
      />
    </div>
  </div>
</template>

<style scoped>
.scrollable-hidden {
  overflow-x: auto;
  /* Masque la barre sur Firefox */
  scrollbar-width: none;
  /* Masque la barre sur Internet Explorer et Edge */
  -ms-overflow-style: none;
}

.scrollable-hidden::-webkit-scrollbar {
  /* Masque la barre sur Chrome, Safari et Opera */
  display: none;
}
</style>
