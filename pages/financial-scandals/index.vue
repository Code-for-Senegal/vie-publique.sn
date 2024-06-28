<script setup lang="ts">
const router = useRouter();
const scandales = ref<any[]>([]);

const runtimeConfig = useRuntimeConfig();
const showScandals = ref(runtimeConfig.public.showScandals === 'true');

onMounted(async () => {
  // FIXME
  // scandales.value = (await import('@/assets/data/scandales-financiers.json'))
  //   .default.sort((a, b) => new Date(b.date_publication).getTime() - new Date(a.date_publication).getTime());
});

function goToScandaleDetails(scandal: any) {
  router.push(`/financial-scandals/${scandal.id}`);
}
</script>

<template>
  <div class="gap-5">
    <div v-if="showScandals">
      <UCard v-for="scandale in scandales" :key="scandale.id" class="mb-2 cursor-pointer custom-shadow"
        @click="goToScandaleDetails(scandale)">
        <!-- <NuxtLink :to="{name: ''}"> -->
        <div class="flex flex-col md:flex-row">
          <!-- left desktop & tab -->
          <div class="md:w-1/3 mb-1">
            <img :src="scandale.image_url" :alt="scandale.titre" class="w-full h-auto">
          </div>
          <!-- right desktop & tab -->
          <div class="md:w-2/3 pl-2 flex flex-col justify-between">
            <div>
              <h3 class="text-xl">{{ scandale.titre }}</h3>
              <p class="text-gray-500 text-sm my-2">{{ scandale.sous_titre }}</p>
            </div>
            <div>
              <span>Date: {{ scandale.annee }}</span>
              <!-- <span class="block mt-1">Publié le: {{ new Date(scandale.date_publication).toLocaleDateString() }}</span> -->
            </div>
          </div>
        </div>
        <!-- </NuxtLink> -->
      </UCard>
    </div>
    <div v-else class="justify-center text-gray-500 text-sm">
      <p> Page en cours de rédaction... </p>
      <p> Nous listerons ici la liste des scandales financiers au sénégal</p>
    </div>
  </div>

</template>
