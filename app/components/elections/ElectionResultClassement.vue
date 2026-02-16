<script setup lang="ts">
import type { Coalition } from "~~/types/coalition";

interface Props {
  coalitions: Coalition[];
  loading?: boolean;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  type: 'legislative'
});

const sortConfig = ref({
  field: "voix" as "voix" | "sieges",
  direction: "desc" as "asc" | "desc",
});

const toggleSort = (field: "voix" | "sieges") => {
  if (sortConfig.value.field === field) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.field = field;
    sortConfig.value.direction = "desc";
  }
};

const getSortIcon = (field: string) => {
  if (sortConfig.value.field !== field) return "i-heroicons-arrows-up-down";
  return sortConfig.value.direction === "asc"
    ? "i-heroicons-arrow-up"
    : "i-heroicons-arrow-down";
};

const rows = computed(() => {
  const mapped = props.coalitions.map((c) => {
    let siegesCount = c.sieges || 0;
    if (props.type === 'legislative') {
      const seatsNational = Number(c.sieges) || 0;
      const seatsDept = Number(c.sieges_departement) || 0;
      siegesCount = seatsNational + seatsDept;
    }
    return {
      ...c,
      totalSieges: siegesCount,
      rawVoix: Number(c.voix) || 0,
      rawPourcentage: Number(c.pourcentage) || 0,
    };
  });

  const sorted = mapped.sort((a, b) => {
    const field = sortConfig.value.field;
    let valA = 0;
    let valB = 0;
    if (field === 'voix') {
      valA = a.rawVoix;
      valB = b.rawVoix;
    } else if (field === 'sieges') {
      valA = a.totalSieges;
      valB = b.totalSieges;
    }
    const multiplier = sortConfig.value.direction === "asc" ? 1 : -1;
    return (valA - valB) * multiplier;
  });

  return sorted.map((c, index) => ({
    ...c,
    rank: index + 1,
    pourcentageDisplay: c.pourcentage ? `${Number(c.pourcentage).toFixed(2)}%` : '-',
    voixDisplay: c.voix ? new Intl.NumberFormat('fr-FR').format(c.voix) : '-',
    displaySieges: siegesCount(c),
  }));

  function siegesCount(c: typeof mapped[0]) {
    return c.totalSieges > 0 ? c.totalSieges : '-';
  }
});
</script>

<template>
  <div>
    <!-- Header Classement -->
    <h3 class="text-lg font-black uppercase tracking-tight mb-3">Classement</h3>

    <!-- Sort controls -->
    <div class="flex items-center justify-end gap-4 mb-2 text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 px-1">
      <button class="flex items-center gap-1 hover:text-primary-600 transition-colors" @click="toggleSort('voix')">
        Voix
        <UIcon :name="getSortIcon('voix')" class="h-3 w-3" />
      </button>
      <button
        v-if="type === 'legislative'"
        class="flex items-center gap-1 hover:text-primary-600 transition-colors"
        @click="toggleSort('sieges')"
      >
        Sièges
        <UIcon :name="getSortIcon('sieges')" class="h-3 w-3" />
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="i in 6" :key="i" class="h-16 w-full rounded-xl" />
    </div>

    <!-- Rows -->
    <div v-else class="space-y-1.5">
      <div
        v-for="row in rows"
        :key="row.id"
        class="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
      >
        <!-- Logo -->
        <div class="flex-shrink-0">
          <UAvatar
            :src="useCmsImage(row.logo)"
            :alt="row.name"
            size="sm"
            :ui="{ rounded: 'rounded-lg' }"
            class="bg-gray-100 dark:bg-gray-800"
          />
        </div>

        <!-- Name + Head of list -->
        <div class="min-w-0 flex-1">
          <h4 class="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
            {{ row.name }}
          </h4>
          <p v-if="row.head_of_list" class="text-xs text-gray-500 truncate">
            {{ row.head_of_list.first_name }} {{ row.head_of_list.last_name }}
          </p>
        </div>

        <!-- Votes -->
        <div class="flex-shrink-0 text-right">
          <div class="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
            {{ row.voixDisplay }}
          </div>
          <div class="text-[10px] text-gray-500 tabular-nums">
            {{ row.pourcentageDisplay }}
          </div>
        </div>

        <!-- Seats (legislative) -->
        <div v-if="type === 'legislative'" class="flex-shrink-0 w-10 text-right">
          <span
            v-if="row.totalSieges > 0"
            class="inline-flex items-center justify-center min-w-[28px] h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-black text-gray-900 dark:text-white tabular-nums"
          >
            {{ row.totalSieges }}
          </span>
          <span v-else class="text-xs text-gray-300 dark:text-gray-600">-</span>
        </div>
      </div>
    </div>
  </div>
</template>
