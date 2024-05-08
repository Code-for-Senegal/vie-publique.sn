<script setup lang="ts">
const rapport = ref<any | null>(null);
const resume = ref<any | null>(null);

const route = useRoute();

onMounted(async () => {
  rapport.value = (await import('@/assets/data/rapports-liste.json')).default
    .find(s => s.slug === route.params.slug);

  resume.value = (await import('@/assets/data/rapports-details.json')).default
    .find(s => s.id === route.params.slug);
});

const links = [{ label: '← Retour à la liste rapports', to: '/' }]

function showResume(rapport: any): boolean {
  return rapport != null && rapport.resume_disponible && resume != null
}
</script>

<template>
  <UBreadcrumb v-if="rapport != null" divider=">" :links=links class="mb-2 px-2.5" />

  <UCard v-if="rapport != null" class="custom-shadow mb-2">
    <div>
      <img v-if="rapport.organisme == 'ARMP'" src="~/assets/logos/armp.png" class="organisme-logo" />
      <img v-if="rapport.organisme == 'OFNAC'" src="~/assets/logos/ofnac.png" class="organisme-logo" />
      <img v-if="rapport.organisme == 'IGE'" src="~/assets/logos/ige.png" class="organisme-logo" />
      <img v-if="rapport.organisme == 'Cours des comptes'" src="~/assets/logos/cour_des_comptes.png"
        class="organisme-logo" />
    </div>
    <h1 class="text-xl sm:text-2xl">{{ rapport.titre }}</h1>
    <p class="text-gray-500 text-sm mb-2">{{ rapport.sous_titre }}</p>
    <p class="text-gray-500 text-sm mb-2">
      Période contrôlée: {{ rapport.period }}
    </p>
    <p class="text-gray-500 text-sm mb-2">
      Date de publication: {{ new Date(rapport.date_publication).toLocaleDateString() }}
    </p>

    <UButton size="sm" icon="i-heroicons-arrow-down-tray" truncate color="black" variant="outline" :to="rapport.url_pdf"
      target="_blank" label="Télécharger le document PDF" class="w-full sm:w-1/2 md:w-1/2 xl:w-1/3">
    </UButton>
  </UCard>

  <UCard v-if="showResume(rapport)" class="custom-shadow">
    <div class="p-2 text-sm">
      <ul v-if="resume && resume.summary">
        <li v-for="(summaryItem, i) in resume.summary" :key="i">
          {{ summaryItem }}
        </li>
      </ul>
      <h2 v-if="resume && resume.title" class="font-bold mt-4"> {{ resume.title }}</h2>
    </div>

    <UAccordion v-if="resume && resume.investigations" :items="resume.investigations">
      <template #default="{ item, index, open }">
        <UButton color="gray" variant="ghost" class="border-b border-gray-200 dark:border-gray-700"
          :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }">

          <span class="truncate">{{ index + 1 }}. {{ item.title }}</span>

          <template #trailing>
            <UIcon name="i-heroicons-chevron-right-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform duration-200" :class="[open && 'rotate-90']" />
          </template>
        </UButton>
      </template>
      <template #item="{ item }">
        <div class="text-gray-900 dark:text-white p-4">
          <p>{{ item.file_title }}</p>

          <h4 class="font-semibold mt-2">Référence</h4>
          <p>{{ item.reference }}</p>

          <h4 class="font-semibold mt-1">Décision OFNAC</h4>
          <UBadge color="white" variant="solid">{{ item.ofnac_decision }}</UBadge>

          <div v-if="item.facts_denounced != null && item.facts_denounced.length > 0">
            <h4 class="font-semibold mt-1">Les faits dénoncés</h4>
            <ul class="list-disc">
              <li v-for="(factItem, i) in item.facts_denounced" :key="i" class="text-sm ml-4 mt-1">
                {{ factItem }}
              </li>
            </ul>
          </div>

          <h4 class="font-semibold mt-1">Lanceur d'alerte</h4>
          <p>{{ item.whistleblower }}</p>

          <h4 class="font-semibold mt-1">Personnes incriminées</h4>
          <ul class="list-disc">
            <li v-for="(person, i) in item.incriminated" :key="i" class="text-sm ml-4 mt-1">
              {{ person.name }}
              <span v-if="person.position">, {{ person.position }}</span>
            </li>
          </ul>

          <h4 class="font-semibold mt-1">Infractions</h4>
          <p>{{ item.infractions.join(', ') }}</p>

          <h4 class="font-semibold mt-1">Montant du préjudice</h4>
          <p>{{ item.prejudice_amount }}</p>

          <h4 class="font-semibold mt-1">Période des faits</h4>
          <p>{{ item.facts_period }}</p>

        </div>
      </template>
    </UAccordion>
  </UCard>

  <UCard v-else class="text-sm text-gray-500 font-normal">
    <p>
      cliquer sur le bouton pour télécharger le rapport pdf. La rédaction du résumé est en cours...
    </p>
  </UCard>
</template>