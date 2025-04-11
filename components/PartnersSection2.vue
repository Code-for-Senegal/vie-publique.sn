<!-- components/Partners.vue -->
<script setup lang="ts">
interface Partner {
  name: string;
  logo: string;
  url: string;
  description: string;
}

const partners: Partner[] = [
  {
    name: "OFNAC",
    logo: "https://www.giz.de/static/en/images/giz-logo.gif",
    url: "https://www.ofnac.sn",
    description: "Office National de Lutte Contre la Fraude et la Corruption",
  },
  {
    name: "Cour des Comptes",
    logo: "https://www.usaid.gov/themes/custom/uswds_usaid/logo-overlay.svg",
    url: "http://www.courdescomptes.sn",
    description: "Institution supérieure de contrôle des finances publiques",
  },
  {
    name: "Journal Officiel",
    logo: "https://www.afd.fr/sites/afd/files/logo_0.png",
    url: "http://www.jo.gouv.sn",
    description: "Journal Officiel de la République du Sénégal",
  },
];
</script>

<template>
  <section class="my-12">
    <h2 class="mb-8 text-center text-2xl font-bold text-gray-800">
      Nos Partenaires
    </h2>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="partner in partners"
        :key="partner.name"
        class="transition-transform hover:scale-105"
      >
        <a
          :href="partner.url"
          target="_blank"
          rel="noopener noreferrer"
          class="block p-4"
        >
          <img
            :src="partner.logo"
            :alt="partner.name"
            class="mx-auto mb-4 h-24 object-contain"
          />
          <h3 class="mb-2 text-center text-lg font-semibold">
            {{ partner.name }}
          </h3>
          <p class="text-center text-sm text-gray-600">
            {{ partner.description }}
          </p>
        </a>
      </UCard>
    </div>
  </section>
</template>
