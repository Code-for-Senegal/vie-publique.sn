<!-- components/Election/ElectionResultHemicycle2.vue -->
<template>
  <div class="w-full">
    <div class="mb-4 text-center">
      <!-- <h2 class="text-2xl font-bold">Projections Assemblé Nationale</h2> -->
      <h4 class="text-sm text-gray-500">
        Proclamation des résultats par la Commission Electorale Nationale
      </h4>
      <p class="text-sm text-gray-500">Mis à jour Jeudi 21 Nov à 17h</p>
    </div>
    <div class="flex flex-col">
      <!-- Légende compacte -->
      <div class="text-center">
        <ElectionResultSvgHemicycle class="w-full" />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div
          v-for="coalition in data"
          :key="coalition.coalition"
          class="flex items-center space-x-2 p-2 text-sm transition-transform hover:scale-105"
          :style="{
            backgroundColor: coalition.color,
            backgroundImage: `linear-gradient(to bottom, ${coalition.color}, ${darkenColor(coalition.color, 20)})`,
          }"
        >
          <span class="text-base font-bold text-white">{{
            coalition.seats
          }}</span>
          <span class="text-xs font-medium text-white">{{
            coalition.coalition.toUpperCase()
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface HeadOfList {
  photo_url: string;
  full_name: string;
}

interface CoalitionData {
  coalition: string;
  color: string;
  seats: number;
  head_of_list: HeadOfList | null;
}
const props = defineProps<{
  data: CoalitionData[];
}>();

// Fonction pour assombrir une couleur
const darkenColor = (hex: string, percent: number) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};
</script>

<style scoped></style>
