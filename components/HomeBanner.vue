<script setup lang="ts">
interface Menu {
  label: string;
  description: string;
  icon: any;
  to: string;
}

const props = defineProps<{
  menus: Menu[];
}>();
</script>

<template>
  <div class="relative overflow-hidden rounded-lg shadow-lg">
    <!-- Image de fond avec effet sombre -->
    <div
      class="absolute inset-0 bg-cover bg-center"
      :style="{ backgroundImage: `url('/images/elections/assemble-1.jpg')` }"
    >
      <div class="absolute inset-0 bg-black opacity-60"></div>
      <!-- Overlay sombre pour lisibilité du texte -->
    </div>

    <!-- Contenu du bloc -->
    <div class="relative z-10 p-8 text-center text-white">
      <h2 class="mb-4 text-4xl font-extrabold">Législatives 2024</h2>
      <p class="mb-6 text-lg font-semibold leading-relaxed drop-shadow-md">
        Découvrez les coalitions, les candidats et informations essentielles
        pour les élections du 17 Novembre.
      </p>
      <NuxtLink
        to="/elections"
        class="inline-block rounded-full bg-green-700 px-6 py-2 text-lg font-semibold shadow-lg transition hover:bg-green-800"
      >
        Consulter les informations
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Styles supplémentaires pour la transition */
.relative {
  transition: transform 0.3s ease-in-out;
}
.relative:hover {
  transform: scale(1.02);
}
</style>
