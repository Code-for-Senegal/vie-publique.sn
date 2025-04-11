<!-- components/Election/ResultGlobal.vue -->
<template>
  <div class="w-full">
    <!-- Header avec stats globales -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Résultats Départements</h2>
          <UButton
            :loading="loading"
            :disabled="loading"
            icon="i-heroicons-arrow-path"
            variant="soft"
            @click="fetchResults"
          >
            Actualiser
          </UButton>
        </div>
      </template>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <!-- Stats Globales -->
        <UCard>
          <div class="text-center">
            <div class="text-sm text-gray-500">Bureaux traités</div>
            <div class="text-2xl font-bold">
              {{ globalStats.bureauxTraites }}%
            </div>
            <div class="text-xs text-gray-400">
              {{ totalBureauxTraites }} sur {{ totalBureaux }} bureaux
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="text-sm text-gray-500">Participation</div>
            <div class="text-2xl font-bold">
              {{ globalStats.participation }}%
            </div>
            <div class="text-xs text-gray-400">
              {{ totalVotants.toLocaleString() }} votants
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="text-center">
            <div class="text-sm text-gray-500">Suffrages exprimés</div>
            <div class="text-2xl font-bold">
              {{ totalExprimesGlobal.toLocaleString() }}
            </div>
          </div>
        </UCard>
      </div>
    </UCard>

    <!-- Classement Global des Coalitions -->
    <UCard class="mb-6">
      <template #header>
        <h3 class="text-lg font-semibold">Classement Global</h3>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-2 text-left">Rang</th>
              <th class="p-2 text-left">Coalition</th>
              <th class="p-2 text-right">Votes</th>
              <th class="p-2 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(coalition, index) in globalRanking"
              :key="coalition.id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-2 font-medium">{{ index + 1 }}</td>
              <td class="p-2">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :src="`/default-image-2.gif`"
                    :alt="coalition.nom"
                    size="sm"
                  />
                  <span class="line-clamp-1" :title="coalition.nom">
                    {{ coalition.nom }}
                  </span>
                </div>
              </td>
              <td class="p-2 text-right font-medium">
                {{ coalition.votes.toLocaleString() }}
              </td>
              <td class="p-2 text-right">
                <UBadge :color="getBadgeColor(coalition.pourcentage)">
                  {{ coalition.pourcentage.toFixed(2) }}%
                </UBadge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>

    <!-- Résultats par Département -->
    <div v-if="results.length" class="space-y-4">
      <UCard
        v-for="department in sortedDepartments"
        :key="department.region + department.departement"
      >
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold">{{ department.departement }}</h3>
              <p class="text-sm text-gray-500">{{ department.region }}</p>
            </div>
            <div class="text-right text-sm">
              <div>
                Participation: {{ formatNumber(department.tauxParticipation) }}%
              </div>
              <div>
                Bureaux traités:
                {{ formatNumber(department.pourcentageBureauTraité) }}%
              </div>
            </div>
          </div>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="p-2 text-left">Coalition</th>
                <th class="p-2 text-right">Votes</th>
                <th class="p-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="candidate in sortedCandidates(
                  department.resultatsCandidats,
                )"
                :key="candidate.coalitionId"
                class="border-t hover:bg-gray-50"
              >
                <td class="p-2">{{ candidate.nom }}</td>
                <td class="p-2 text-right">
                  {{ candidate.nombreVotes.toLocaleString() }}
                </td>
                <td class="p-2 text-right">
                  <UBadge :color="getBadgeColor(candidate.pourcentage)">
                    {{ formatNumber(candidate.pourcentage) }}%
                  </UBadge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <template #footer>
          <div class="grid grid-cols-3 gap-2 text-sm text-gray-500">
            <div>
              Inscrits: {{ department.totalElecteursInscrits.toLocaleString() }}
            </div>
            <div class="text-center">
              Exprimés: {{ department.totalSuffragesExprimes.toLocaleString() }}
            </div>
            <div class="text-right">
              Nuls: {{ department.totalBulletinsNuls.toLocaleString() }}
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Candidate } from "~/types/election";

const { results, loading, error, fetchResults } = useElectionResults();

// Global stats computation
const globalStats = computed(() => {
  if (!results.value?.length) return { bureauxTraites: 0, participation: 0 };

  const totalBureaux = results.value.reduce(
    (sum, d) => sum + d.totalBureaux,
    0,
  );
  const bureauxTraites = results.value.reduce(
    (sum, d) => sum + d.totalBureauxTraites,
    0,
  );
  const participation =
    results.value.reduce((sum, d) => sum + d.tauxParticipation, 0) /
    results.value.length;

  return {
    bureauxTraites: formatNumber((bureauxTraites / totalBureaux) * 100),
    participation: formatNumber(participation),
  };
});

// Computed values for statistics
const totalBureaux = computed(() =>
  results.value.reduce((sum, d) => sum + d.totalBureaux, 0),
);

const totalBureauxTraites = computed(() =>
  results.value.reduce((sum, d) => sum + d.totalBureauxTraites, 0),
);

const totalVotants = computed(() =>
  results.value.reduce((sum, d) => sum + d.totalSuffragesExprimes, 0),
);

const totalExprimesGlobal = computed(() =>
  results.value.reduce((sum, d) => sum + d.totalVotesExprimes, 0),
);

// Global ranking computation
const globalRanking = computed(() => {
  if (!results.value?.length) return [];

  // Créer un map pour agréger les votes par coalition
  const coalitionMap = new Map();

  results.value.forEach((dept) => {
    dept.resultatsCandidats.forEach((candidate) => {
      if (!coalitionMap.has(candidate.coalitionId)) {
        coalitionMap.set(candidate.coalitionId, {
          id: candidate.coalitionId,
          nom: candidate.nom,
          votes: 0,
          pourcentage: 0,
        });
      }

      const coalition = coalitionMap.get(candidate.coalitionId);
      coalition.votes += candidate.nombreVotes;
    });
  });

  // Calculer les pourcentages et trier
  const totalVotes = [...coalitionMap.values()].reduce(
    (sum, c) => sum + c.votes,
    0,
  );

  return [...coalitionMap.values()]
    .map((coalition) => ({
      ...coalition,
      pourcentage: (coalition.votes / totalVotes) * 100,
    }))
    .sort((a, b) => b.votes - a.votes);
});

// Departments sorted by region/departement
const sortedDepartments = computed(() => {
  return [...results.value].sort((a, b) => {
    if (a.region !== b.region) return a.region.localeCompare(b.region);
    return a.departement.localeCompare(b.departement);
  });
});

// Utility functions
const formatNumber = (num: number) => Number(num.toFixed(2));

const sortedCandidates = (candidates: Candidate[]) => {
  return [...candidates].sort((a, b) => b.nombreVotes - a.nombreVotes);
};

const getBadgeColor = (percentage: number) => {
  if (percentage >= 15) return "green";
  if (percentage >= 5) return "blue";
  return "gray";
};

// Initial data load
onMounted(() => {
  fetchResults();
});
</script>
