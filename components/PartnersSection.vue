<script setup lang="ts">
import { ref, onMounted } from "vue";

const partners = ref([]);

const API_URL = "https://cms.vie-publique.sn/items/vp_partners";
const API_TOKEN = "7FnM4F9fp2YXzrknODG57Nv54-HxH_uk";

const fetchPartners = async () => {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });
    const data = await response.json();
    if (data && data.data) {
      partners.value = data.data.map((partner) => ({
        ...partner,
        logo: `https://cms.vie-publique.sn/assets/${partner.logo}`,
      }));
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des partenaires:", error);
  }
};

onMounted(() => {
  fetchPartners();
});
</script>

<template>
  <div class="mt-8">
    <h2 class="text-center text-2xl font-semibold text-gray-800">
      Nos Partenaires
    </h2>
    <div
      class="mt-8 flex flex-wrap justify-center gap-8"
      aria-label="Logos des partenaires"
    >
      <a
        v-for="partner in partners"
        :key="partner.id"
        :href="partner.website"
        target="_blank"
        rel="noopener noreferrer"
        class="partner-card flex w-48 transform flex-col items-center rounded-lg bg-white p-6 shadow-md transition-shadow hover:scale-105 hover:shadow-lg"
      >
        <img
          :src="partner.logo"
          :alt="`Logo de ${partner.name}`"
          class="partner-logo h-24 w-auto object-contain transition-transform duration-300 hover:scale-110"
        />
        <span class="mt-4 text-center text-sm font-medium text-gray-700">
          {{ partner.name }}
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.partner-card {
  transition: all 0.3s ease;
}

.partner-logo {
  transition: transform 0.3s ease;
}

.partner-card:hover .partner-logo {
  transform: scale(1.1);
}

.partner-card:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}
</style>
