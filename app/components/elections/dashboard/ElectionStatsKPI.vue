<template>
  <div
    v-if="hasAnyStats"
    class="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 p-4 sm:p-6 shadow-xl"
  >
    <h3 class="mb-4 sm:mb-6 text-center text-base sm:text-lg font-bold text-yellow-400">
      Chiffres Clés de l'Élection
    </h3>

    <div :class="gridClasses">
      <!-- Inscrits -->
      <div
        v-if="election.registered_voters"
        class="group rounded-lg bg-emerald-800/30 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-1.5 sm:gap-2">
          <UIcon
            name="i-heroicons-users"
            class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-xs sm:text-sm text-emerald-100">Inscrits</p>
        </div>
        <p class="mt-1 text-base sm:text-lg font-bold text-white">
          {{ formatNumber(election.registered_voters) }}
        </p>
      </div>

      <!-- Votants -->
      <div
        v-if="election.voters_count"
        class="group rounded-lg bg-emerald-800/30 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-1.5 sm:gap-2">
          <UIcon
            name="i-heroicons-hand-raised"
            class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-xs sm:text-sm text-emerald-100">Votants</p>
        </div>
        <p class="mt-1 text-base sm:text-lg font-bold text-white">
          {{ formatNumber(election.voters_count) }}
        </p>
      </div>

      <!-- Bulletins nuls -->
      <div
        v-if="election.null_ballots"
        class="group rounded-lg bg-emerald-800/30 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-1.5 sm:gap-2">
          <UIcon
            name="i-heroicons-x-circle"
            class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-xs sm:text-sm text-emerald-100">Nuls</p>
        </div>
        <p class="mt-1 text-base sm:text-lg font-bold text-white">
          {{ formatNumber(election.null_ballots) }}
        </p>
      </div>

      <!-- Suffrages Valables -->
      <div
        v-if="election.valid_votes"
        class="group rounded-lg bg-emerald-800/30 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-1.5 sm:gap-2">
          <UIcon
            name="i-heroicons-check-circle"
            class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-xs sm:text-sm text-emerald-100">Suffrages</p>
        </div>
        <p class="mt-1 text-base sm:text-lg font-bold text-white">
          {{ formatNumber(election.valid_votes) }}
        </p>
      </div>

      <!-- Majorité absolue (présidentielle uniquement) -->
      <div
        v-if="election.absolute_majority && election.type === 'presidential'"
        class="group rounded-lg bg-emerald-800/30 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-1.5 sm:gap-2">
          <UIcon
            name="i-heroicons-academic-cap"
            class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-xs sm:text-sm text-emerald-100">Maj. Absolue</p>
        </div>
        <p class="mt-1 text-base sm:text-lg font-bold text-white">
          {{ formatNumber(election.absolute_majority) }}
        </p>
      </div>

      <!-- Quotient National (législative uniquement) -->
      <div
        v-if="election.national_quotient && election.type === 'legislative'"
        class="group rounded-lg bg-emerald-800/30 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-1.5 sm:gap-2">
          <UIcon
            name="i-heroicons-calculator"
            class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-xs sm:text-sm text-emerald-100">Quotient</p>
        </div>
        <p class="mt-1 text-base sm:text-lg font-bold text-white">
          {{ formatNumber(Math.round(election.national_quotient)) }}
        </p>
      </div>

      <!-- Participation -->
      <div
        v-if="election.participation_rate"
        class="group rounded-lg bg-emerald-800/30 p-3 sm:p-4 backdrop-blur-sm transition-all hover:bg-emerald-800/50"
      >
        <div class="flex items-center gap-1.5 sm:gap-2">
          <UIcon
            name="i-heroicons-chart-bar"
            class="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 transition-transform group-hover:scale-110"
          />
          <p class="text-xs sm:text-sm text-emerald-100">Participation</p>
        </div>
        <p class="mt-1 text-base sm:text-lg font-bold text-white">
          {{ formatDecimal(election.participation_rate) }} %
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Election {
  id?: number;
  type?: string;
  status?: string;
  registered_voters?: number;
  voters_count?: number;
  null_ballots?: number;
  valid_votes?: number;
  absolute_majority?: number;
  national_quotient?: number;
  participation_rate?: number;
}

const props = defineProps<{
  election: Election;
}>();

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('fr-FR').format(value);
};

const formatDecimal = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const hasAnyStats = computed(() => {
  const e = props.election;
  return e?.registered_voters || e?.voters_count || e?.null_ballots ||
         e?.valid_votes || e?.participation_rate ||
         (e?.absolute_majority && e?.type === 'presidential') ||
         (e?.national_quotient && e?.type === 'legislative');
});

// Dynamic grid classes based on number of visible stats
const visibleStatsCount = computed(() => {
  const e = props.election;
  let count = 0;
  if (e?.registered_voters) count++;
  if (e?.voters_count) count++;
  if (e?.null_ballots) count++;
  if (e?.valid_votes) count++;
  if (e?.absolute_majority && e?.type === 'presidential') count++;
  if (e?.national_quotient && e?.type === 'legislative') count++;
  if (e?.participation_rate) count++;
  return count;
});

const gridClasses = computed(() => {
  const count = visibleStatsCount.value;
  if (count <= 3) {
    return 'grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4';
  } else if (count <= 4) {
    return 'grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4';
  } else if (count <= 5) {
    return 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4';
  } else {
    return 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4';
  }
});
</script>
