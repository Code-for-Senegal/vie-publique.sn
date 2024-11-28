<!-- # components/Election/ElectionResultPvGrid.vue -->
<template>
  <div>
    <div class="py-2">
      <div class="container">
        <div class="prose prose-sm sm:prose my-2">
          <h1 class="">Annuaire des députés</h1>
        </div>

        <template v-if="!loading && deputies">
          <!-- <p class="mt-2 text-gray-600">{{ deputies.length }} candidats élus</p> -->
        </template>
      </div>
    </div>

    <!-- Filtres -->
    <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
      <USelect
        v-model="selectedCoalition"
        :options="coalitionOptions"
        placeholder="Filtrer par coalition"
        class="custom-shadow max-w-xs"
        clearable
      />
      <USelect
        v-model="selectedGender"
        :options="genderOptions"
        placeholder="Filtrer par genre"
        class="custom-shadow max-w-xs"
        clearable
      />
    </div>

    <!-- Loading State -->
    <template v-if="loading && !deputies.length">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-48" />
      </div>
    </template>

    <!-- Error State -->
    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      class="mb-4"
    >
      {{ error }}
    </UAlert>

    <!-- Content -->
    <div v-else>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div
          v-for="deputy in filteredDeputies"
          :key="deputy.id"
          class="relative flex h-56 flex-col overflow-hidden rounded-lg shadow-lg"
          @click="openModal(deputy)"
        >
          <!-- Image du candidat ou image par défaut -->
          <img
            v-if="deputy.photo"
            :src="$directusImageUrl(deputy.photo, '50')"
            :alt="deputy.first_name + ' ' + deputy.last_name"
            class="h-full w-full object-cover"
            loading="lazy"
            fetchpriority="high"
          />
          <img
            v-else
            :src="
              deputy.gender === 'M'
                ? '/adobe-default-profil-man.jpg'
                : '/adobe-default-profil-women.jpg'
            "
            alt="Default image"
            class="h-full w-full object-cover"
          />

          <!-- Overlay sombre uniquement si c'est l'image par défaut -->
          <div
            v-if="!deputy.photo"
            class="absolute inset-0 bg-black bg-opacity-70"
          ></div>

          <!-- Overlay sombre si la photo est présente -->
          <div
            v-if="deputy.photo"
            class="absolute inset-0 bg-black bg-opacity-40"
          ></div>

          <!-- Texte superposé (Nom, prénom, profession) -->
          <div
            class="absolute inset-0 flex flex-col justify-end p-2 text-white"
          >
            <h4 class="truncate text-sm font-bold capitalize">
              {{ deputy.first_name.toLowerCase() }}
              <span class="font-bold tracking-wider">
                {{ deputy.last_name.toUpperCase() }}
              </span>
            </h4>

            <p class="mb-1 truncate text-xs lowercase">
              {{ $getAgeFromBirthdate(deputy.birthdate) }} ans |
              {{ deputy.profession.toLowerCase() }}
            </p>
            <h4
              class="left-2 top-2 p-1 text-xs font-bold text-white"
              :style="{
                backgroundColor: deputy.electoral_list.coalition.color,
              }"
            >
              {{ deputy.electoral_list.coalition.name }}
              <span v-if="deputy.electoral_list.constituency">{{
                deputy.electoral_list.constituency.name
              }}</span>
              <!-- {{ deputy.electoral_list.name }} -->
            </h4>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div
        v-if="selectedCandidate"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click="closeModal"
      >
        <div
          class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white"
          @click.stop
        >
          <div class="sticky top-0 z-10 border-b bg-white p-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold capitalize">
                <!-- {{ selectedCandidate.first_name.toLowerCase() }}
                <span class="font-bold tracking-wider">
                  {{ selectedCandidate.last_name.toUpperCase() }}
                </span> -->
                {{ selectedCandidate.electoral_list.name }}
              </h2>
              <button
                @click="closeModal"
                class="text-gray-500 hover:text-gray-700"
              >
                <span class="text-2xl">&times;</span>
              </button>
            </div>
          </div>

          <div class="p-4">
            <!-- Image -->
            <div class="mb-6">
              <img
                v-if="selectedCandidate.photo"
                :src="$directusImageUrl(selectedCandidate.photo, '50')"
                alt="PV"
                class="h-auto max-w-full rounded-lg shadow-md"
              />
            </div>
            <!-- Informations -->
            <div class="rounded-lg bg-white shadow">
              <div class="text-center">
                <h2 class="text-xl font-semibold">
                  <span class="capitalize">{{
                    selectedCandidate.first_name.toLowerCase()
                  }}</span>
                  {{ selectedCandidate.last_name.toUpperCase() }}
                </h2>
                <div v-if="selectedCandidate.profession" class="mt-1">
                  <p class="text-sm font-semibold capitalize text-green-700">
                    {{ selectedCandidate.profession.toLowerCase() }}
                  </p>
                </div>

                <div v-if="selectedCandidate.birthdate" class="mt-1">
                  <p class="text-sm">
                    {{ $getAgeFromBirthdate(selectedCandidate.birthdate) }} ans
                  </p>
                </div>

                <div
                  v-if="
                    selectedCandidate.birthplace && selectedCandidate.birthdate
                  "
                  class="mt-1"
                >
                  <p class="text-sm text-gray-500">Date et lieu de naissance</p>
                  <p class="text-sm">
                    {{ $dateMonthYearformat(selectedCandidate.birthdate) }} à
                    {{ selectedCandidate.birthplace }}
                  </p>
                </div>
                <div v-if="selectedCandidate.biography" class="mt-1">
                  <p class="text-sm">
                    {{ selectedCandidate.biography }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Refresh button -->
    <!-- <div class="fixed bottom-4 right-4">
      <UButton
        :loading="loading"
        :disabled="loading"
        icon="i-heroicons-arrow-path"
        color="gray"
        variant="soft"
        @click="scrollToTop"
      >
        Actualiser
      </UButton>
    </div> -->
    <UButton
      v-show="showButton"
      :ui="{ rounded: 'rounded-full' }"
      color="gray"
      icon="i-heroicons-arrow-up-circle"
      @click="scrollToTop"
    >
      Revenir en haut
    </UButton>
  </div>
</template>

<script setup lang="ts">
interface Deputy {
  id: number;
  first_name: string;
  last_name: string;
  profession: string;
  photo: string;
  gender: string;
  birthplace: string;
  birthdate: string;
  biography: string;
  electoral_list: {
    type: string;
    name: string;
    coalition: {
      name: string;
      color: string;
    };
    constituency: any;
  };
}

// Initialiser le composable avec la source appropriée
const { deputies, loading, error, fetchElectedDeputies } =
  useElectionElectedCandidates();

const selectedCandidate = ref<Deputy | null>(null);
const selectedCoalition = ref<string | null>(null);
const selectedGender = ref<string | null>(null);

// Options pour le filtre de genre
const genderOptions = [
  { label: "Homme", value: "M" },
  { label: "Femme", value: "F" },
];

// Computed property pour obtenir les options de coalition uniques
const coalitionOptions = computed(() => {
  if (!deputies.value) return [];

  const uniqueCoalitions = new Set(
    deputies.value.map(
      (deputy: Deputy) => deputy.electoral_list.coalition.name,
    ),
  );

  return [
    // { label: "Toutes les coalitions", value: null },
    ...Array.from(uniqueCoalitions).map((coalition) => ({
      label: coalition,
      value: coalition,
    })),
  ];
});

// Computed property pour filtrer les députés selon la coalition et le genre
const filteredDeputies = computed(() => {
  if (!deputies.value) return [];

  return deputies.value.filter((deputy: Deputy) => {
    const matchesCoalition =
      !selectedCoalition.value ||
      deputy.electoral_list.coalition.name === selectedCoalition.value;

    const matchesGender =
      !selectedGender.value || deputy.gender === selectedGender.value;

    return matchesCoalition && matchesGender;
  });
});

// Méthode pour obtenir le label de localisation en fonction de la source
// const getLocationLabel = (pv: any) => {
//   if (currentSource.value === "etranger") {
//     return `${pv.repDiplomatique} - ${pv.localite}`;
//   }
//   return `${pv.departement} - ${pv.commune}`;
// };

// Handle refresh
const handleRefresh = () => {
  fetchElectedDeputies();
};

// Modal functions
const openModal = (candidat: Deputy) => {
  selectedCandidate.value = candidat;
};

const closeModal = () => {
  selectedCandidate.value = null;
};

// Handle escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && selectedCandidate.value) {
      closeModal();
    }
  };

  window.addEventListener("scroll", checkScroll);
  window.addEventListener("keydown", handleEscape);
  onUnmounted(() => {
    window.removeEventListener("scroll", checkScroll);
    window.removeEventListener("keydown", handleEscape);
  });
});

const showButton = ref(false);

const checkScroll = (): void => {
  showButton.value = window.scrollY > 300;
};

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
</script>
