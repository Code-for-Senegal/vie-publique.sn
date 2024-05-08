<script setup lang="ts">

const rapports = ref<any[]>([]);
const searchQuery = ref('')
const selectedOrganisme = ref('')
const selectedYear = ref('')

const router = useRouter();

const organismes = ['Cours des Comptes', 'OFNAC', 'IGE', 'ARMP'];
// const organismes = computed(() => [...new Set(rapports.value.map(rapport => rapport.organisme))])

const years = computed(() => [...new Set(rapports.value.map(rapport => rapport.annee))].sort((a, b) => b - a))

const filteredRapports = computed(() => rapports.value.filter(rapport => {
  return (
    (searchQuery.value.length === 0 || rapport.titre.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
    (selectedOrganisme.value === '' || rapport.organisme === selectedOrganisme.value) &&
    (selectedYear.value === '' || rapport.annee === parseInt(selectedYear.value))
  )
}))

onMounted(async () => {
  rapports.value = (await import('@/assets/data/rapports-liste.json'))
    .default.sort((a, b) => new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime());
});

function goToRapportDetails(rapport: any) {
  router.push(`/reports/${rapport.slug}`);
}

</script>

<template>

  <UInput size="md" v-model="searchQuery" placeholder="Rechercher..." icon="i-heroicons-magnifying-glass"
    class="input w-full mb-1 custom-shadow" />

  <div class="flex overflow-x-auto sm:flex-wrap sm:flex-wrap justify-start sm:justify-center gap-2 my-3 scrollable-hidden">
    <UButton class="custom-shadow"
      :class="[selectedOrganisme === '' ? 'bg-neutral-900' : 'bg-white text-inherit hover:bg-neutral-900 hover:text-white']"
      @click="selectedOrganisme = ''">
      Tous
    </UButton>
    <UButton v-for="organisme in organismes" :key="organisme" class="custom-shadow"
      :class="[selectedOrganisme === organisme ? 'bg-neutral-900' : 'bg-white text-inherit hover:bg-neutral-900 hover:text-white']"
      @click="selectedOrganisme = selectedOrganisme === organisme ? '' : organisme">
      {{ organisme }}
    </UButton>
  </div>

  <div class="flex flex-col gap-2">
    <UCard v-for="rapport in filteredRapports" :key="rapport.id" class="cursor-pointer custom-shadow"
      @click="goToRapportDetails(rapport)">

      <div class="flex flex-row gap-2">

        <div>
          <img v-if="rapport.organisme == 'ARMP'" src="~/assets/logos/armp.png" class="organisme-logo" />
          <img v-if="rapport.organisme == 'OFNAC'" src="~/assets/logos/ofnac.png" class="organisme-logo" />
          <img v-if="rapport.organisme == 'IGE'" src="~/assets/logos/ige.png" class="organisme-logo" />
          <img v-if="rapport.organisme == 'Cours des Comptes'" src="~/assets/logos/cour_des_comptes.png"
            class="organisme-logo" />

          <img v-if="rapport.organisme == 'Autres'" src="~/assets/logos/doc.svg" class="organisme-logo" />
          <!-- <USkeleton v-if="rapport.organisme == 'Autres'" class="h-12 w-12" /> -->
        </div>

        <div>
          <h3 class="text-md font-semibold">{{ rapport.titre }}</h3>
          <p class="text-gray-500 text-sm">{{ rapport.sous_titre }}</p>
        </div>

      </div>

    </UCard>
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
