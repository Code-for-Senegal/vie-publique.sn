<script setup>
import { ref, onMounted } from 'vue';

const runtimeConfig = useRuntimeConfig();
const showPinnedPeoples = ref(runtimeConfig.public.showPinnedPeoples === 'true');

const peoples = ref([]);

const router = useRouter();

onMounted(async () => {
  peoples.value = (await import('@/assets/data/personnes-epinglees.json')).default
    .filter(person => person.display)
    .sort((a, b) => b.annee - b.annee);
});

function goToIndividualCitedDetails(item) {
  router.push(`/individuals-cited/${item.slug}`);
}
</script>

<template>
  <p v-if="showPinnedPeoples" class="text-gray-500 text-sm mb-2">
    Les personnes cités ici sont présumées innocentes en l'absence d'une décision de justice définitive.
  </p>
  <div v-if="showPinnedPeoples" class="grid-container">
    <UCard v-for="item in peoples" :key="item.id" class="person-card custom-shadow cursor-pointer"
      @click="goToIndividualCitedDetails(item)">
      <div class="flex flex-col items-center">
        <img :src="item.photo" alt="Photo de profil" class="profile-photo mb-1">
        <!-- <UDivider/> -->
        <h2 class="font-semibold ">{{ item.nom }}</h2>
        <p class="text-sm text-gray-500">{{ item.fonction }}</p>
      </div>
    </UCard>
  </div>
  <div v-else class="text-gray-500 text-sm">
    <p> Page en cours de rédaction... </p>
    <p> Nous listerons ici la liste des personnes épinglées dans les rapports</p>
  </div>
</template>

<style scoped>
.text-center {
  text-align: center;
}

.person-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-photo {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}
</style>
