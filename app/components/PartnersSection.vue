<script setup lang="ts">
/**
 * Composant de section des partenaires
 */

// Utilisation du composable pour récupérer les partenaires
const { partners, loading, error } = usePartners();
</script>

<template>
  <section class="my-8">
    <h2 class="text-center text-2xl font-semibold text-gray-800 dark:text-slate-200">
      Nos Partenaires
    </h2>

    <!-- État de chargement -->
    <div v-if="loading" class="mt-8 flex justify-center">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
    </div>

    <!-- Message d'erreur -->
    <UAlert
      v-else-if="error"
      color="red"
      variant="soft"
      title="Erreur de chargement"
      description="Impossible de charger les partenaires pour le moment."
      class="mx-auto mt-8 max-w-lg"
    />

    <!-- Liste des partenaires -->
    <div
      v-else-if="partners.length > 0"
      class="mt-8 flex flex-nowrap justify-start gap-4 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-3 md:justify-items-center md:px-0 md:pb-0"
      aria-label="Logos des partenaires"
    >
      <NuxtLink
        v-for="partner in partners"
        :key="partner.id"
        :to="{ path: '/a-propos/financement-independance', hash: `#${partner.slug}` }"
        class="partner-card flex w-48 flex-shrink-0 transform flex-col items-center rounded-lg bg-white p-2 shadow-md transition-shadow hover:scale-105 hover:shadow-lg"
      >
        <img
          :src="useCmsImage(partner.logo, '50')"
          :alt="`Logo de ${partner.name}`"
          class="partner-logo h-24 w-auto object-contain transition-transform duration-300 hover:scale-110"
        />
        <span class="sr-only mt-4 text-center text-sm font-medium text-gray-700">
          {{ partner.name }}
        </span>
      </NuxtLink>
    </div>

    <!-- Message si aucun partenaire -->
    <div v-else class="mt-8 text-center text-gray-500">
      Aucun partenaire disponible pour le moment.
    </div>
  </section>
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
