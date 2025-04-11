<script setup lang="ts">
const rapport = ref<any | null>(null);
const resume = ref<any | null>(null);
const route = useRoute();
const { gtag } = useGtag();

onMounted(async () => {
  rapport.value = (
    await import("@/assets/data/rapport/rapports-liste.json")
  ).default.find((s) => s.slug === route.params.slug);

  resume.value = (
    await import("@/assets/data/rapport/rapports-details.json")
  ).default.find((s) => s.id === route.params.slug);

  // Définir les méta-tags une fois les données chargées
  useHead({
    title: rapport.value ? `${rapport.value.titre}` : "Chargement...",
    meta: [
      {
        name: "description",
        content: rapport.value
          ? rapport.value.sous_titre
          : "Description de la page en cours de chargement...",
      },
    ],
  });
});

const links = [{ label: "Rapports", to: "/rapport-senegal" }];

function showResume(rapport: any): boolean {
  return rapport != null && rapport.resume_disponible && resume.value != null;
}

function trackPDFDownload() {
  gtag("event", "download_pdf", {
    event_category: "PDF Downloads",
    event_label: rapport.value.titre,
    value: rapport.value.url_pdf,
  });
}

const runtimeConfig = useRuntimeConfig();
const siteUrl = ref(runtimeConfig.public.siteUrl);
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <h1 v-if="rapport != null" class="sr-only">{{ rapport.titre }}</h1>

    <UButton
      v-if="rapport"
      class="bg-gray custom-shadow mb-2 w-full hover:bg-white"
    >
      <!-- <UBreadcrumb divider=">" :links=links class="px-2.5" /> -->
      <AppBreadcrumb :links="links" :last-text="route.params.slug" />
    </UButton>

    <UCard v-if="rapport != null" class="custom-shadow mb-2 w-full">
      <div>
        <img
          v-if="rapport.organisme == 'ARMP'"
          src="~/assets/logos/armp.webp"
          loading="lazy"
          fetchpriority="high"
          alt="Logo ARMP"
          class="organisme-logo"
          width="60"
          height="40"
        />
        <img
          v-if="rapport.organisme == 'OFNAC'"
          src="~/assets/logos/ofnac.webp"
          loading="lazy"
          fetchpriority="high"
          alt="Logo OFNAC"
          class="organisme-logo"
          width="60"
          height="40"
        />
        <img
          v-if="rapport.organisme == 'IGE'"
          src="~/assets/logos/ige.webp"
          loading="lazy"
          fetchpriority="high"
          alt="Logo IGE"
          class="organisme-logo"
          width="60"
          height="40"
        />
        <img
          v-if="rapport.organisme == 'Cours des Comptes'"
          src="~/assets/logos/cour_des_comptes.webp"
          loading="lazy"
          fetchpriority="high"
          alt="Logo Cours des Comptes"
          class="organisme-logo"
          width="60"
          height="40"
        />
        <img
          v-if="rapport.organisme == 'Autres'"
          src="~/assets/logos/doc.svg"
          loading="lazy"
          fetchpriority="high"
          alt="Logo rapport"
          class="organisme-logo"
          width="60"
          height="40"
        />
        <img
          v-if="rapport.organisme == 'CENTIF'"
          src="~/assets/logos/centif.webp"
          loading="lazy"
          fetchpriority="high"
          alt="Logo CENTIF"
          class="organisme-logo"
          width="60"
          height="40"
        />
      </div>

      <h1 class="text-xl sm:text-2xl">{{ rapport.titre }}</h1>
      <p class="mb-2 text-sm text-gray-500">{{ rapport.sous_titre }}</p>
      <!-- <p class="text-gray-500 text-sm mb-2">
      Période contrôlée: {{ rapport.period }}
    </p> -->
      <p class="mb-2 text-sm text-gray-500">
        Date de publication:
        {{ $dateMonthYearformat(rapport.date_publication) }}
      </p>

      <UButton
        size="sm"
        icon="i-heroicons-arrow-down-tray"
        truncate
        color="primary"
        variant="solid"
        :to="rapport.url_pdf"
        target="_blank"
        label="Télécharger le document PDF"
        class="w-full sm:w-1/2 md:w-1/2 xl:w-1/3"
        @click="trackPDFDownload"
      >
      </UButton>
    </UCard>

    <UCard v-if="showResume(rapport)" class="custom-shadow w-full">
      <div class="p-2 text-sm">
        <ul v-if="resume && resume.summary" class="list-disc">
          <li
            v-for="(summaryItem, i) in resume.summary"
            :key="i"
            class="mb-3 ml-5"
          >
            <span v-if="summaryItem.title != null" class="font-semibold">
              {{ summaryItem.title }}:
            </span>
            {{ summaryItem.content }}
          </li>
        </ul>
        <h2 v-if="resume && resume.title" class="mt-4 font-semibold">
          {{ resume.title }}
        </h2>
      </div>

      <UAccordion
        v-if="resume && resume.investigations"
        :items="resume.investigations"
      >
        <template #default="{ item, index, open }">
          <UButton
            color="gray"
            variant="ghost"
            class="border-b border-gray-200 dark:border-gray-700"
            :ui="{ rounded: 'rounded-none', padding: { sm: 'p-3' } }"
          >
            <span class="truncate">{{ index + 1 }}. {{ item.title }}</span>

            <template #trailing>
              <UIcon
                name="i-heroicons-chevron-right-20-solid"
                class="ms-auto h-5 w-5 transform transition-transform duration-200"
                :class="[open && 'rotate-90']"
              />
            </template>
          </UButton>
        </template>
        <template #item="{ item }">
          <div class="p-4 text-gray-900 dark:text-white">
            <p>{{ item.file_title }}</p>

            <h4 class="mt-2 font-semibold">Référence</h4>
            <p>{{ item.reference }}</p>

            <h4 class="mt-1 font-semibold">Décision OFNAC</h4>
            <UBadge color="white" variant="solid">{{
              item.ofnac_decision
            }}</UBadge>

            <div
              v-if="
                item.facts_denounced != null && item.facts_denounced.length > 0
              "
            >
              <h4 class="mt-1 font-semibold">Les faits dénoncés</h4>
              <ul class="list-disc">
                <li
                  v-for="(factItem, i) in item.facts_denounced"
                  :key="i"
                  class="ml-4 mt-1 text-sm"
                >
                  {{ factItem }}
                </li>
              </ul>
            </div>

            <h4 class="mt-1 font-semibold">Lanceur d'alerte</h4>
            <p>{{ item.whistleblower }}</p>

            <h4 class="mt-1 font-semibold">Personnes incriminées</h4>
            <ul class="list-disc">
              <li
                v-for="(person, i) in item.incriminated"
                :key="i"
                class="ml-4 mt-1 text-sm"
              >
                {{ person.name }}
                <span v-if="person.position">, {{ person.position }}</span>
              </li>
            </ul>

            <h4 class="mt-1 font-semibold">Infractions</h4>
            <p>{{ item.infractions.join(", ") }}</p>

            <h4 class="mt-1 font-semibold">Montant du préjudice</h4>
            <p>{{ item.prejudice_amount }}</p>

            <h4 class="mt-1 font-semibold">Période des faits</h4>
            <p>{{ item.facts_period }}</p>
          </div>
        </template>
      </UAccordion>
    </UCard>

    <UCard v-else class="w-full text-sm font-normal text-gray-500">
      <p>
        cliquer sur le bouton pour télécharger le rapport pdf. La rédaction du
        résumé est en cours...
      </p>

      <div v-if="rapport != null" class="mt-2">
        <embed
          :src="
            'https://drive.google.com/viewerng/viewer?embedded=true&url=' +
            siteUrl +
            rapport.url_pdf
          "
          type="application/pdf"
          width="100%"
          height="600px"
          title="test"
        />
      </div>
    </UCard>
  </div>
</template>
