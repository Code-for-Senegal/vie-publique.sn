<script setup lang="ts">
/**
 * Composant de section des partenaires
 */

// Utilisation du composable pour récupérer les partenaires
const { partners, loading, error } = usePartners();
</script>

<template>
  <section class="my-8">
    <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white">
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
      class="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8"
      aria-label="Logos des partenaires"
    >
      <NuxtLink
        v-for="partner in partners"
        :key="partner.id"
        to="#"
        class="partner-card flex h-24 w-40 flex-col items-center justify-center rounded-lg bg-white p-2 shadow-sm transition-all hover:shadow-md md:h-28 md:w-48"
      >
        <div class="flex h-16 w-full items-center justify-center p-2">
          <img
            :src="useCmsImage(partner.logo, '80')"
            :alt="`Logo de ${partner.name}`"
            class="partner-logo max-h-full max-w-full object-contain grayscale transition-all duration-300 hover:scale-110 hover:grayscale-0"
          />
        </div>
        <span class="sr-only mt-2 text-center text-xs font-medium text-gray-700">
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

/* Suppression des effets de survol redondants gérés par Tailwind */
</style>
