<script setup lang="ts">
interface MunicipalityInfo {
  municipality: string;
  voters: number;
  offices: number;
  places: number;
  population: number;
}

interface DepartmentInfo {
  departement: string;
  region: string;
  municipalities: MunicipalityInfo[];
  totalVoters: number;
  totalOffices: number;
  totalPlaces: number;
  totalPopulation: number;
  municipalityCount: number;
}

interface Props {
  department: DepartmentInfo | null;
  isOpen: boolean;
  electionId?: string | number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{ close: [] }>();
const route = useRoute();

// Détection responsive
const isMobile = ref(false);

onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024;
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
  });
});

// Recherche de communes
const searchQuery = ref('');

// Reset la recherche quand le département change
watch(() => props.department, () => {
  searchQuery.value = '';
});

// Communes filtrées par recherche
const filteredCommunes = computed(() => {
  if (!props.department?.municipalities?.length) return [];
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return props.department.municipalities;
  return props.department.municipalities.filter(c =>
    c.municipality.toLowerCase().includes(q)
  );
});

// Top 3 communes par nombre d'électeurs
const topCommunes = computed(() => {
  if (!props.department?.municipalities?.length) return [];
  return [...props.department.municipalities]
    .sort((a, b) => b.voters - a.voters)
    .slice(0, 3);
});

// Indique si on a des données de communes
const hasCommuneData = computed(() => {
  return (props.department?.municipalities?.length || 0) > 0;
});

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return 'N/A';
  return value.toLocaleString('fr-FR');
};

// Construire l'URL de détail du département
const getDepartmentDetailUrl = () => {
  if (!props.department) return '/';
  const query: Record<string, string> = {};

  if (route.query.type) {
    query.type = route.query.type as string;
  }
  if (route.query.year) {
    query.year = route.query.year as string;
  }

  return {
    path: `/elections-senegal/carte-electorale/nationale/${encodeURIComponent(props.department.departement.toUpperCase())}`,
    query,
  };
};


</script>

<template>
  <!-- Backdrop mobile -->
  <Transition name="fade">
    <div
      v-if="isOpen && isMobile"
      class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      @click="emit('close')"
    />
  </Transition>

  <!-- Panel -->
  <Transition :name="isMobile ? 'slide-up' : 'slide-right'">
    <aside
      v-if="isOpen && department"
      :class="[
        isMobile
          ? 'fixed bottom-14 left-0 right-0 z-50 max-h-[70vh] rounded-t-2xl'
          : 'fixed right-4 top-20 bottom-4 w-[380px] z-30 rounded-2xl',
        'bg-white dark:bg-gray-900 shadow-2xl overflow-hidden flex flex-col',
        'border border-gray-200 dark:border-gray-700',
      ]"
    >
      <!-- Drag handle mobile -->
      <div v-if="isMobile" class="flex justify-center pt-2 pb-1 shrink-0">
        <div class="h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
      </div>

      <!-- Header -->
      <div class="shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">
              {{ department.departement }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Région {{ department.region }}
            </p>
          </div>
          <button
            class="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fermer"
            @click="emit('close')"
          >
            <UIcon name="i-heroicons-x-mark" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <!-- Recherche commune -->
        <div v-if="hasCommuneData" class="relative">
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            :placeholder="`Rechercher parmi ${department.municipalityCount} communes...`"
            size="sm"
            class="w-full"
            :ui="{ icon: { trailing: { pointer: '' } } }"
          >
            <template v-if="searchQuery" #trailing>
              <button
                class="flex items-center"
                @click="searchQuery = ''"
              >
                <UIcon name="i-heroicons-x-circle" class="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            </template>
          </UInput>
        </div>
      </div>

      <!-- Contenu scrollable -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <!-- Grille statistiques -->
        <div class="grid grid-cols-2 gap-2 p-4">
          <div class="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
            <div class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Électeurs
            </div>
            <div class="text-lg font-black tabular-nums text-green-700 dark:text-green-400 mt-0.5">
              {{ formatNumber(department.totalVoters) }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
            <div class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Communes
            </div>
            <div class="text-lg font-black tabular-nums text-green-700 dark:text-green-400 mt-0.5">
              {{ department.municipalityCount }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
            <div class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Lieux de vote
            </div>
            <div class="text-lg font-black tabular-nums text-green-700 dark:text-green-400 mt-0.5">
              {{ formatNumber(department.totalPlaces) }}
            </div>
          </div>
          <div class="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
            <div class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              Bureaux
            </div>
            <div class="text-lg font-black tabular-nums text-green-700 dark:text-green-400 mt-0.5">
              {{ formatNumber(department.totalOffices) }}
            </div>
          </div>
        </div>

        <!-- Top 3 communes -->
        <div v-if="topCommunes.length > 0 && !searchQuery" class="px-4 pb-3">
          <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Top 3 communes par électeurs
          </h3>
          <div class="space-y-1.5">
            <div
              v-for="(commune, index) in topCommunes"
              :key="commune.municipality"
              class="flex items-center justify-between rounded-xl bg-gradient-to-r p-3"
              :class="[
                index === 0 ? 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 ring-1 ring-yellow-200 dark:ring-yellow-800/40' :
                index === 1 ? 'from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 ring-1 ring-gray-200 dark:ring-gray-700' :
                'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 ring-1 ring-orange-200 dark:ring-orange-800/40'
              ]"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  {{ commune.municipality }}
                </span>
              </div>
              <span class="text-sm font-black tabular-nums text-green-700 dark:text-green-400">
                {{ formatNumber(commune.voters) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Séparateur -->
        <div v-if="hasCommuneData" class="mx-4 border-t border-gray-100 dark:border-gray-800" />

        <!-- Liste des communes filtrées -->
        <div v-if="hasCommuneData" class="px-4 py-3">
          <h3 class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {{ searchQuery ? `Résultats (${filteredCommunes.length})` : `Toutes les communes (${department.municipalities.length})` }}
          </h3>

          <!-- État vide de recherche -->
          <div v-if="searchQuery && filteredCommunes.length === 0" class="py-6 text-center">
            <UIcon name="i-heroicons-magnifying-glass" class="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Aucune commune trouvée pour « {{ searchQuery }} »
            </p>
          </div>

          <!-- Liste -->
          <div v-else class="space-y-1 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
            <div
              v-for="commune in filteredCommunes"
              :key="commune.municipality"
              class="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300 truncate mr-2">
                {{ commune.municipality }}
              </span>
              <div class="flex items-center gap-3 shrink-0 text-xs text-gray-500 dark:text-gray-400">
                <span class="font-semibold tabular-nums text-green-700 dark:text-green-400">
                  {{ formatNumber(commune.voters) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bouton navigation -->
      <div class="shrink-0 p-4 pt-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <NuxtLink
          :to="getDepartmentDetailUrl()"
          class="flex items-center justify-center gap-2 w-full rounded-xl bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 py-3 text-center font-bold text-white transition-colors"
        >
          <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
          Voir le département
        </NuxtLink>
      </div>
    </aside>
  </Transition>
</template>

<style scoped>
/* Slide depuis la droite (desktop) */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-right-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Slide depuis le bas (mobile) */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

/* Backdrop fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar fine pour la liste */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.dark .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
