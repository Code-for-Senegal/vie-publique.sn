<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const showPinnedPeoples = ref(
  runtimeConfig.public.showPinnedPeoples === "true",
);

const peoples = ref([]);
const router = useRouter();

const metaTitle =
  "vie-publique.sn - personnes épinglées rapport OFNAC Cour des comptes IGE";
const metaDescription =
  "Liste des personnalités épinglées par OFNAC, Cours des Comptes et IGE";

useHead({
  title: metaTitle,
  meta: [{ name: "description", content: metaDescription }],
});

onMounted(async () => {
  peoples.value = (
    await import("@/assets/data/personnes-epinglees.json")
  ).default
    .filter((person) => person.display)
    .sort((a, b) => a.id - b.id);
});

function goToIndividualCitedDetails(item) {
  router.push(`/individuals-cited/${item.slug}`);
}
</script>

<template>
  <div class="flex flex-col items-center px-4 sm:px-8">
    <h1 class="sr-only">Liste des personnalités épinglées au Sénégal</h1>
    <h1 class="mb-2 mt-4 text-center text-xl font-semibold">
      Liste des personnalités épinglées par les corps de contrôle
    </h1>

    <p v-if="showPinnedPeoples" class="mb-2 text-sm text-gray-500">
      Les personnes cités ici sont présumées innocentes en l'absence d'une
      décision de justice définitive.
    </p>
    <div v-if="showPinnedPeoples" class="grid-container">
      <UCard
        v-for="item in peoples"
        :key="item.id"
        class="person-card custom-shadow cursor-pointer"
        @click="goToIndividualCitedDetails(item)"
      >
        <div class="flex flex-col items-center">
          <img
            :src="item.photo"
            loading="lazy"
            fetchpriority="high"
            alt="Photo de profil"
            class="profile-photo mb-1"
          />
          <!-- <UDivider/> -->
          <h2 class="font-semibold">{{ item.nom }}</h2>
          <p class="text-sm text-gray-500">{{ item.fonction }}</p>
        </div>
      </UCard>
    </div>
    <div v-else class="text-sm text-gray-500">
      <p>Page en cours de rédaction...</p>
      <p>
        Nous listerons ici la liste des personnes épinglées dans les rapports
      </p>
    </div>
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
  width: 90px;
  height: 100px;
  object-fit: cover;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}
</style>
