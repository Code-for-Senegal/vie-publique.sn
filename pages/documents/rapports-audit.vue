<script setup lang="ts">
const { documents, loading, error } = useDocuments({ type: "audit_report" });
const router = useRouter();

useHead({
  title: "Rapports public Sénégal OFNAC Cours des compte",
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

const filteredRapports = computed(() => {
  if (!documents.value) return [];

  const query = searchQuery.value.toLowerCase().trim();

  return documents.value.filter((rapport) => {
    // Vérification des valeurs nulles
    const title = rapport.title?.toLowerCase() || "";
    const description = rapport.description?.toLowerCase() || "";
    const institution = rapport.audit_institution || "";
    const annee = rapport.annee || null;

    // Recherche dans le titre et la description
    const matchesSearch =
      query.length === 0 ||
      title.includes(query) ||
      description.includes(query);

    // Filtre par organisme
    const matchesOrganisme =
      selectedOrganisme.value === "" || institution === selectedOrganisme.value;

    // Filtre par année
    const matchesYear =
      selectedYear.value === "" ||
      (annee && annee === parseInt(selectedYear.value));

    return matchesSearch && matchesOrganisme && matchesYear;
  });
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
  <div class="container mx-auto px-4 py-4">
    <!-- Bouton retour -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour"
      color="gray"
      @click="router.back()"
    />

    <h1 class="sr-only">
      Rapports d'audits publics Sénégal OFNAC Cour des comptes IGE CENTIF
    </h1>

    <ClientOnly>
      <div class="prose prose-sm sm:prose mx-auto my-2">
        <h1 class="text-center text-xl text-gray-900 sm:text-2xl">
          Rapports publics
        </h1>
      </div>
      <p
        v-if="rowsfilteredRapports.length > 1"
        class="mb-4 text-center text-sm text-gray-500"
      >
        {{ documents.length }} rapports disponibles
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

      <template v-if="loading">
        <div v-for="n in 3" :key="`skeleton-${n}`">
          <USkeleton class="custom-shadow mb-2 h-24 w-full bg-white" />
        </div>
      </template>

      <UAlert
        v-else-if="error"
        title="Erreur lors du chargement des rapports"
        color="red"
        icon="i-heroicons-exclamation-triangle"
        description="Impossible de charger les rapports. Veuillez réessayer plus tard."
      >
        <template #description>
          <p class="text-sm text-gray-500">
            {{ error }}
          </p>
        </template>
      </UAlert>

      <div
        v-else-if="filteredRapports.length === 0 && searchQuery"
        class="mt-4 text-center"
      >
        <UAlert
          title="Aucun résultat"
          description="Aucun rapport ne correspond à votre recherche"
          color="gray"
          icon="i-heroicons-information-circle"
        />
      </div>

      <div v-else class="flex flex-col gap-2">
        <!-- Afficher les cartes de rapport une fois chargées -->
        <UCard
          v-for="rapport in rowsfilteredRapports"
          :key="rapport.id"
          class="custom-shadow cursor-pointer"
        >
          <NuxtLink
            :to="`/documents/${rapport.id}/${rapport.slug}`"
            class="flex flex-row gap-2"
          >
            <div class="w-12 flex-shrink-0 md:w-16">
              <img
                v-if="rapport.audit_institution == 'ARMP'"
                src="~/assets/logos/armp.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo ARMP"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'OFNAC'"
                src="~/assets/logos/ofnac.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo OFNAC"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'IGE'"
                src="~/assets/logos/ige.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo IGE"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'Cour des Comptes'"
                src="~/assets/logos/cour_des_comptes.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo Cours des Comptes"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'CENTIF'"
                src="~/assets/logos/centif.webp"
                loading="lazy"
                fetchpriority="high"
                alt="Logo CENTIF"
                class="organisme-logo h-auto w-11 md:w-12 lg:w-14"
                width="60"
                height="40"
              />
              <img
                v-if="rapport.audit_institution == 'Autres'"
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
              <p class="text-sm font-normal">{{ rapport.title }}</p>
              <!-- <p class="text-sm text-gray-500">{{ rapport.description }}</p> -->
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div
        class="flex justify-center border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
        <UPagination
          v-model="page"
          size="md"
          :page-count="pageCount"
          :total="filteredRapports.length"
          :active-button="{ color: 'gray' }"
        />
      </div>
    </ClientOnly>
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
