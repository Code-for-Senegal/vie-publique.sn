<script setup lang="ts">

useHead({
  title: "Sénégal Rapports OFNAC Cours des compte IGE",
  meta: [
    {
      name: 'description',
      content: "Rapports publics du Sénégal. ARMP, IGE, IGF, OFNAC, et Cours des Comptes",
    }
  ]
})

const rapports = ref<any[]>([]);
const searchQuery = ref('')
const selectedOrganisme = ref('')
const selectedYear = ref('')

const organismes = ['Cours des Comptes', 'OFNAC', 'IGE', 'ARMP'];

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

</script>

<template>

  <div class="flex flex-col items-center px-4 sm:px-8">

    <!-- <Submenu /> -->

    <h1 class="sr-only">Rapports d'audits Sénégal OFNAC Cours des comptes IGE</h1>
    <h1 class="text-xl font-semibold text-center mt-4 mb-2">
      Rapports d'audits des corps de contrôle du Sénégal
    </h1>
    <p v-if="rapports.length > 1" class="text-sm mb-4 text-gray-500">
      {{ rapports.length }} rapports disponibles
    </p>

    <UInput size="md" v-model="searchQuery" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass"
      class="input w-full mb-1 custom-shadow" />

    <div
      class="flex overflow-x-auto sm:flex-wrap sm:flex-wrap justify-start sm:justify-center gap-2 my-3 scrollable-hidden">
      <UButton class="custom-shadow" :color="selectedOrganisme === '' ? 'primary' : 'white'"
        @click="selectedOrganisme = ''">
        Tous
      </UButton>
      <!-- :class="[selectedOrganisme === organisme ? 'primary' : 'bg-white text-inherit hover:bg-neutral-900 hover:text-white']" -->
      <UButton v-for="organisme in organismes" :key="organisme" class="custom-shadow"
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
      <UCard v-else v-for="rapport in filteredRapports" :key="rapport.id" class="cursor-pointer custom-shadow">

        <NuxtLink :to="`/reports/${rapport.slug}`" class="flex flex-row gap-2">

          <div class="flex-shrink-0 w-12 md:w-16">
            <img v-if="rapport.organisme == 'ARMP'" src="~/assets/logos/armp.webp" loading="lazy" alt="Logo ARMP"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" />
            <img v-if="rapport.organisme == 'OFNAC'" src="~/assets/logos/ofnac.webp" loading="lazy" alt="Logo OFNAC"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" />
            <img v-if="rapport.organisme == 'IGE'" src="~/assets/logos/ige.webp" loading="lazy" alt="Logo IGE"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" />
            <img v-if="rapport.organisme == 'Cours des Comptes'" src="~/assets/logos/cour_des_comptes.webp"
              loading="lazy" alt="Logo Cours des Comptes" class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60"
              height="40" />
            <img v-if="rapport.organisme == 'Autres'" src="~/assets/logos/doc.svg" loading="lazy" alt="Logo rapport"
              class="organisme-logo w-11 md:w-12 lg:w-14 h-auto" width="60" height="40" />
          </div>

          <div class="flex-grow">
            <p class="text-sm font-semibold">{{ rapport.titre }}</p>
            <p class="text-gray-500 text-sm">{{ rapport.sous_titre }}</p>
          </div>

        </NuxtLink>

      </UCard>
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
