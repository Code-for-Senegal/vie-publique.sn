<!-- # components/Election/ElectionResultPvGrid.vue -->
<template>
  <div>
    <div class="py-5">
      <div class="container">
        <div class="prose prose-sm sm:prose my-2">
          <h1 class="">
            Les députés de l'Assemblée nationale
          </h1>
        </div>

        <template v-if="!loading && props.deputies">
          <!-- <p class="mt-2 text-gray-600">{{ deputies.length }} candidats élus</p> -->
        </template>
      </div>
    </div>

    <!-- Conteneur principal avec grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne des filtres (1/4 en desktop) -->
      <div class="lg:col-span-1">
        <!-- Filtres -->
        <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div class="flex flex-col gap-5">
            <!-- Champ de recherche -->
            <div>
              <UInput v-model="searchQuery" placeholder="Rechercher un député..." icon="i-heroicons-magnifying-glass"
                class="custom-shadow max-w-md" clearable />
            </div>
            <!-- Filtre par genre -->
            <div>
              <USelect v-model="selectedGender" :options="genderOptions" placeholder="Filtrer par genre"
                class="custom-shadow" clearable />
            </div>
            <!-- Tag coalition -->
            <div class="flex flex-col gap-2">
              <!-- Liste verticale en desktop -->
              <div class="hidden lg:flex lg:flex-col ">
                <div v-for="coalition in coalitionOptions" :key="coalition.value"
                  class="flex items-center gap-2 group cursor-pointer" @click="toggleCoalition(coalition.value)">
                  <!-- Indicateur à gauche -->
                  <div class="w-4 h-4 rounded-full transition-colors duration-200" :class="{
                    'bg-gray-100': selectedCoalition !== coalition.value
                  }" :style="{
                    backgroundColor: selectedCoalition === coalition.value ? getCoalitionColor(coalition.value) : ''
                  }">
                  </div>

                  <!-- Nom de la coalition -->
                  <span class="px-4 py-2 text-sm transition-colors duration-200 hover:font-semibold hover:text-gray-600"
                    :class="{
                      'font-medium': selectedCoalition === coalition.value
                    }">
                    {{ coalition.label }}
                  </span>
                </div>
              </div>

              <!-- Tags en mobile -->
              <div class="flex flex-wrap gap-2 lg:hidden">
                <button v-for="coalition in coalitionOptions" :key="coalition.value"
                  @click="toggleCoalition(coalition.value)"
                  class="rounded-full px-4 py-1 text-[0.8rem] transition-colors duration-200" :class="{
                    'bg-gray-100 text-gray-800 hover:bg-gray-200': selectedCoalition !== coalition.value,
                    'text-white': selectedCoalition === coalition.value
                  }" :style="{
                    backgroundColor: selectedCoalition === coalition.value ? getCoalitionColor(coalition.value) : ''
                  }">
                  {{ coalition.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Colonne de la liste des députés (3/4 en desktop) -->
      <div class="lg:col-span-2">
        <!-- Loading State -->
        <template v-if="loading && !props.deputies.length">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <USkeleton v-for="i in 6" :key="i" class="h-48" />
          </div>
        </template>

        <!-- Error State -->
        <UAlert v-if="error" icon="i-heroicons-exclamation-triangle" color="red" variant="soft" class="mb-4">
          {{ error }}
        </UAlert>

        <!-- Content -->
        <div v-else>
          <TransitionGroup name="deputies-grid" tag="div" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="deputy in filteredDeputies" :key="deputy.id"
              class="relative flex h-56 flex-col overflow-hidden rounded-lg shadow-lg">
              <NuxtLink :to="`/deputes/${deputy.id}`" class="block">

                <!-- Image du candidat ou image par défaut -->
                <img v-if="deputy.photo" :src="$directusImageUrl(deputy.photo, '50')"
                  :alt="deputy.first_name + ' ' + deputy.last_name" class="h-full w-full object-cover" loading="lazy"
                  fetchpriority="high" />
                <img v-else :src="deputy.gender === 'M'
                  ? '/adobe-default-profil-man.jpg'
                  : '/adobe-default-profil-women.jpg'
                  " alt="Default image" class="h-full w-full object-cover" />

                <!-- Overlay sombre uniquement si c'est l'image par défaut -->
                <div v-if="!deputy.photo" class="absolute inset-0 bg-black bg-opacity-70"></div>

                <!-- Overlay sombre si la photo est présente -->
                <div v-if="deputy.photo" class="absolute inset-0 bg-black bg-opacity-40"></div>

                <!-- Texte superposé (Nom, prénom, profession) -->
                <div class="absolute inset-0 flex flex-col justify-end p-2 text-white">
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
                  <h4 class="left-2 top-2 p-1 text-xs font-bold text-white" :style="{
                    backgroundColor: deputy.electoral_list.coalition.color,
                  }">
                    {{ deputy.electoral_list.coalition.name }}
                    <span v-if="deputy.electoral_list.constituency">{{
                      deputy.electoral_list.constituency.name
                      }}</span>
                  </h4>
                </div>
              </NuxtLink>
            </div>
          </TransitionGroup>

        </div>
      </div>
    </div>

    <UButton v-show="showButton" :ui="{ rounded: 'rounded-full' }" color="gray" icon="i-heroicons-arrow-up-circle"
      @click="scrollToTop">
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

// Définition du type
type DeputyRef = Ref<Deputy[]> | Ref<null>;

const props = defineProps({
  deputies: {
    type: Object as PropType<DeputyRef>,
    required: true,
  },
  loading: {
    type: Object as PropType<Ref<boolean>>,
    required: true,
  },
  error: {
    type: Object as PropType<Ref<string | null>>,
    required: false,
  },
});

const selectedCoalition = ref<string | null>(null);
const selectedGender = ref<string | null>(null);
const searchQuery = ref("");

// Options pour le filtre de genre
const genderOptions = [
  { label: "Homme", value: "M" },
  { label: "Femme", value: "F" },
];

// Computed property pour obtenir les options de coalition uniques
const coalitionOptions = computed(() => {
  if (!props.deputies) return [];

  const uniqueCoalitions = new Set(
    props.deputies.map(
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
  if (!props.deputies) return [];

  return props.deputies.filter((deputy: Deputy) => {
    const matchesCoalition =
      !selectedCoalition.value ||
      deputy.electoral_list.coalition.name === selectedCoalition.value;

    const matchesGender =
      !selectedGender.value || deputy.gender === selectedGender.value;

    const matchesSearch =
      !searchQuery.value ||
      deputy.first_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      deputy.last_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      deputy.profession.toLowerCase().includes(searchQuery.value.toLowerCase());

    return matchesCoalition && matchesGender && matchesSearch;
  });
});

// Fonction pour basculer la sélection d'une coalition
const toggleCoalition = (coalitionName: string) => {
  if (selectedCoalition.value === coalitionName) {
    selectedCoalition.value = null;
  } else {
    selectedCoalition.value = coalitionName;
  }
};

// Fonction pour obtenir la couleur de la coalition
const getCoalitionColor = (coalitionName: string) => {
  const deputy = props.deputies.find(
    (d: Deputy) => d.electoral_list.coalition.name === coalitionName
  );
  return deputy?.electoral_list.coalition.color || '#gray';
};

// Handle escape key
onMounted(() => {
  window.addEventListener("scroll", checkScroll);
  onUnmounted(() => {
    window.removeEventListener("scroll", checkScroll);
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

<!-- Ajouter ces styles -->
<style scoped>
.deputies-grid-move {
  transition: transform 0.5s ease-in-out;
}

.deputies-grid-enter-active,
.deputies-grid-leave-active {
  transition: all 0.5s ease-in-out;
}

.deputies-grid-enter-from,
.deputies-grid-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.deputies-grid-leave-active {
  position: absolute;
}
</style>