<script setup lang="ts">
interface CountryStats {
  country: string;
  count: {
    office_number: number; // total bureaux
    polling_place: number; // total lieux de vote
  };
  sum: {
    voters: number; // total électeurs
  };
  countDistinct: {
    polling_place: number; // nombre unique de lieux de vote
  };
}

interface Props {
  electionId?: string | number | null;
}

const props = withDefaults(defineProps<Props>(), {
  electionId: null,
});

// Convertir electionId en computed pour la réactivité
const electionIdRef = computed(() => props.electionId);

// Construire les paramètres de requête avec l'ID d'élection
const queryParams = computed(() => {
  const params: Record<string, string> = {};
  if (electionIdRef.value) {
    params.election = String(electionIdRef.value);
  }
  return params;
});

// ✅ Appel API via le serveur Nuxt (SSR-friendly et sécurisé)
const { data: countriesStats } = await useFetch<{ countries: CountryStats[] }>(
  "/api/elections/diaspora/countries",
  {
    key: computed(() => `diaspora-countries-${electionIdRef.value || 'all'}`),
    query: queryParams,
    watch: [electionIdRef],
  }
);

const q = ref("");

// Données triées et filtrées
const filteredRows = computed(() => {
  let rows = countriesStats.value?.countries || [];

  // Appliquer le tri
  if (sortConfig.value.column) {
    rows = [...rows].sort((a, b) => {
      const valueA = getNestedValue(a, sortConfig.value.column);
      const valueB = getNestedValue(b, sortConfig.value.column);

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortConfig.value.direction === "desc"
          ? valueB - valueA
          : valueA - valueB;
      }

      return sortConfig.value.direction === "desc"
        ? String(valueB).localeCompare(String(valueA))
        : String(valueA).localeCompare(String(valueB));
    });
  }

  // Appliquer le filtre
  if (q.value) {
    rows = rows.filter((person) => {
      return Object.values(person).some((value) => {
        return String(value).toLowerCase().includes(q.value.toLowerCase());
      });
    });
  }

  return rows;
});

// Configuration du tri par défaut
const sortConfig = ref({
  column: "sum.voters",
  direction: "desc" as const,
});

// Fonction pour obtenir la valeur imbriquée
const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
};

const router = useRouter();
const route = useRoute();

// Fonction de navigation
const handleRowClick = (row: CountryStats) => {
  // Construire l'URL avec le contexte de l'élection
  const query: Record<string, string> = {};
  if (props.electionId) {
    query.election = String(props.electionId);
  }
  // Conserver le type et l'année de l'URL courante si présents
  if (route.query.type) {
    query.type = route.query.type as string;
  }
  if (route.query.year) {
    query.year = route.query.year as string;
  }

  router.push({
    path: `/elections-senegal/carte-electorale/diaspora/${row.country}`,
    query,
  });
};
</script>

<template>
  <UCard class="mx-auto max-w-7xl">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Pays de la Diaspora</h2>
        <UInput
          v-model="q"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher un pays..."
          class="max-w-sm"
        />
      </div>
    </template>

    <div class="overflow-x-auto">
      <UTable
        :rows="filteredRows"
        :columns="[
          {
            key: 'country',
            label: 'Pays',
            sortable: true,
          },
          {
            key: 'sum.voters',
            label: 'Électeurs',
            sortable: true,
          },
          {
            key: 'countDistinct.polling_place',
            label: 'Lieux de vote',
          },
          {
            key: 'count.office_number',
            label: 'Bureaux de vote',
          },
        ]"
        :sort="sortConfig"
        select-mode="click"
        hover
        :loading="!countriesStats"
        @select="handleRowClick"
      >
        <template #loading>
          <div class="flex justify-center p-4">
            <UProgress />
            chargement
          </div>
        </template>

        <!-- Formater les nombres -->
        <template #cell-sum.voters="{ row }">
          {{ row.sum.voters.toLocaleString("fr-FR") }}
        </template>
      </UTable>
    </div>
  </UCard>
</template>
