<script setup lang="ts">
const router = useRouter();
const scandales = ref<any[]>([]);

const runtimeConfig = useRuntimeConfig();
const showScandals = ref(runtimeConfig.public.showScandals === "true");

function goToScandaleDetails(scandal: any) {
  router.push(`/financial-scandals/${scandal.id}`);
}
</script>

<template>
  <div class="gap-5">
    <div v-if="showScandals">
      <UCard
        v-for="scandale in scandales"
        :key="scandale.id"
        class="custom-shadow mb-2 cursor-pointer"
        @click="goToScandaleDetails(scandale)"
      >
        <!-- <NuxtLink :to="{name: ''}"> -->
        <div class="flex flex-col md:flex-row">
          <!-- left desktop & tab -->
          <div class="mb-1 md:w-1/3">
            <img
              :src="scandale.image_url"
              :alt="scandale.titre"
              class="h-auto w-full"
            />
          </div>
          <!-- right desktop & tab -->
          <div class="flex flex-col justify-between pl-2 md:w-2/3">
            <div>
              <h3 class="text-xl">{{ scandale.titre }}</h3>
              <p class="my-2 text-sm text-gray-500">
                {{ scandale.sous_titre }}
              </p>
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
    <div v-else class="justify-center text-sm text-gray-500">
      <p>Page en cours de rédaction...</p>
      <p>Nous listerons ici la liste des scandales financiers au sénégal</p>
    </div>
  </div>
</template>
