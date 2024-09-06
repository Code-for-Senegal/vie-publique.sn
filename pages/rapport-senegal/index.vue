<script setup lang="ts">

useHead({
  title: "Rapports public Sénégal OFNAC Cours des compte... | Vie-Publique.sn",
  meta: [
    {
      name: 'description',
      content: "Rapports publics du Sénégal. CENTIF, OFNAC, ARMP, IGE, Cours des Comptes",
    }
  ]
})

const rapports = ref<any[]>([]);
const searchQuery = ref('')
const selectedOrganisme = ref('')
const selectedYear = ref('')

const organismes = ['Cours des Comptes', 'OFNAC', 'CENTIF', 'IGE', 'ARMP'];

const filteredRapports = computed(() => rapports.value.filter(rapport => {
  return (
    (searchQuery.value.length === 0
      || rapport.titre.toLowerCase().includes(searchQuery.value.toLowerCase())
      || rapport.sous_titre.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
    (selectedOrganisme.value === '' || rapport.organisme === selectedOrganisme.value) &&
    (selectedYear.value === '' || rapport.annee === parseInt(selectedYear.value))
  )
}))

onMounted(async () => {
  rapports.value = (await import('@/assets/data/rapports-liste.json'))
    .default.sort((a, b) => new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime());
});

/* Pagination */

const page = ref(1)
const pageCount = 20

const rowsfilteredRapports = computed(() => {
  return filteredRapports.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
});

// Réinitialiser la page lors du changement de type
watch(selectedOrganisme, () => {
  page.value = 1;
});

</script>

<template>

  <div class="flex flex-col items-center px-4">

    <!-- <Submenu /> -->

    <h1 class="sr-only">Rapports d'audits publics Sénégal OFNAC Cours des comptes IGE CENTIF</h1>

    <div class="prose prose-sm sm:prose mx-auto my-2">
      <h1 class="text-center">
        Rapports publics
      </h1>
    </div>
    <p v-if="rapports.length > 1" class="text-sm mb-4 text-gray-500">
      {{ rapports.length }} rapports disponibles
    </p>

    <UInput size="md" v-model="searchQuery" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass"
      class="input w-full mb-1 custom-shadow" />

    <div class="text-center w-full my-3">
      <UButton class="custom-shadow ml-1 mb-1" :color="selectedOrganisme === '' ? 'primary' : 'white'"
        @click="selectedOrganisme = ''">
        Tous
      </UButton>
      <UButton v-for="organisme in organismes" :key="organisme" class="custom-shadow ml-1 mb-1"
        :color="selectedOrganisme === organisme ? 'primary' : 'white'"
        @click="selectedOrganisme = selectedOrganisme === organisme ? '' : organisme">
        {{ organisme }}
      </UButton>
    </div>

    <div class="flex flex-col gap-2">

      <!-- Afficher USkeleton si les rapports ne sont pas encore chargés -->
      <div v-if="filteredRapports.length == 0">
        <div v-for="i in 5" :key="`skeleton-${i}`">
          <USkeleton class="h-24 w-full mb-2 custom-shadow bg-white" />
        </div>
      </div>

      <!-- Afficher les cartes de rapport une fois chargées -->
      <UCard v-else v-for="rapport in rowsfilteredRapports" :key="rapport.id" class="cursor-pointer custom-shadow">

        <NuxtLink :to="`/rapport-senegal/${rapport.slug}`" class="flex flex-row gap-2">

          <div class="flex-shrink-0 w-12 md:w-16">
            <img v-if="rapport.organisme == 'ARMP'" src="~/assets/logos/armp.webp" loading="lazy" alt="Logo ARMP"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" fetchpriority="high"/>
            <img v-if="rapport.organisme == 'OFNAC'" src="~/assets/logos/ofnac.webp" loading="lazy" alt="Logo OFNAC"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" fetchpriority="high"/>
            <img v-if="rapport.organisme == 'IGE'" src="~/assets/logos/ige.webp" loading="lazy" alt="Logo IGE"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" fetchpriority="high"/>
            <img v-if="rapport.organisme == 'Cours des Comptes'" src="~/assets/logos/cour_des_comptes.webp"
              loading="lazy" alt="Logo Cours des Comptes" class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60"
              height="40" fetchpriority="high"/>
            <img v-if="rapport.organisme == 'CENTIF'" src="~/assets/logos/centif.webp" loading="lazy" alt="Logo CENTIF"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" fetchpriority="high"/>
            <img v-if="rapport.organisme == 'Autres'" src="~/assets/logos/doc.svg" loading="lazy" alt="Logo rapport"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" fetchpriority="high"/>
          </div>

          <div class="flex-grow">
            <p class="text-sm font-semibold">{{ rapport.titre }}</p>
            <p class="text-gray-500 text-sm">{{ rapport.sous_titre }}</p>
          </div>

        </NuxtLink>

      </UCard>
    </div>

    <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination size="md" v-model="page" :page-count="pageCount" :total="filteredRapports.length" />
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
