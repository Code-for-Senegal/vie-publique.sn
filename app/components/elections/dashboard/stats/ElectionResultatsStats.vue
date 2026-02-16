<script setup lang="ts">
import type { Coalition } from "~~/types/coalition";

interface Props {
  coalitions: Coalition[];
  type?: string;
}

const props = defineProps<Props>();

// Sort Config state
const sortConfig = ref({
  field: "voix",
  direction: "desc" as "asc" | "desc",
});

const toggleSort = (field: "voix" | "pourcentage" | "sieges") => {
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
  // 1. Calculate stats first (seats sum)
  const mapped = props.coalitions.map((c) => {
      let siegesCount = c.sieges || 0;
      // pour legislative, sum seats + seats_department
      if (props.type === 'legislative') {
          const seatsNational = Number(c.sieges) || 0;
          const seatsDept = Number((c as any).sieges_departement) || 0;
          siegesCount = seatsNational + seatsDept;
      }
      return {
          ...c,
          totalSieges: siegesCount,
          rawVoix: Number(c.voix) || 0,
          rawPourcentage: Number(c.pourcentage) || 0
      };
  });

  // 2. Sort
  const sorted = mapped.sort((a, b) => {
      const field = sortConfig.value.field;
      let valA = 0;
      let valB = 0;

      if (field === 'voix') {
          valA = a.rawVoix;
          valB = b.rawVoix;
      } else if (field === 'pourcentage') {
          valA = a.rawPourcentage;
          valB = b.rawPourcentage;
      } else if (field === 'sieges') {
          valA = a.totalSieges;
          valB = b.totalSieges;
      }

      const multiplier = sortConfig.value.direction === "asc" ? 1 : -1;
      return (valA - valB) * multiplier;
  });

  // 3. Final display mapping
  return sorted.map((c, index) => {
    return {
        ...c,
        rank: index + 1, // Note: Rank is based on current sort
        pourcentageDisplay: c.pourcentage ? `${Number(c.pourcentage).toFixed(2)}%` : '-',
        voixDisplay: c.voix ? new Intl.NumberFormat('fr-FR').format(c.voix) : '-',
        displaySieges: c.totalSieges > 0 ? c.totalSieges : '-'
    };
  });
});
</script>

<template>
  <div class="relative overflow-hidden rounded-lg shadow bg-white dark:bg-gray-900 dark:border-gray-800">
    <!-- Corps du tableau -->
    <div class="relative max-h-[600px] overflow-auto">
      <div class="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-800">
        <div class="grid min-w-full grid-cols-12 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          <!-- Title Column -->
          <div :class="[type === 'legislative' ? 'col-span-6' : 'col-span-8', 'p-4 flex items-center']">
             Classement
          </div>

          <!-- Votes Column -->
          <div
              :class="[type === 'legislative' ? 'col-span-3' : 'col-span-4', 'p-4 flex items-center justify-end gap-1 cursor-pointer hover:text-primary-600 transition-colors']"
              @click="toggleSort('voix')"
          >
             <span>Voix</span>
             <UIcon :name="getSortIcon('voix')" class="h-3 w-3" />
          </div>

          <!-- Seats Column (Legislative Only) -->
          <div
              v-if="type === 'legislative'"
              class="col-span-3 p-4 flex items-center justify-end gap-1 cursor-pointer hover:text-primary-600 transition-colors"
              @click="toggleSort('sieges')"
          >
             <span>Sièges</span>
             <UIcon :name="getSortIcon('sieges')" class="h-3 w-3" />
          </div>
        </div>
      </div>
      <div
        v-for="(row, idx) in rows"
        :key="row.id"
        class="border-b border-gray-100 dark:border-gray-800/50 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      >
        <div class="grid min-w-full grid-cols-12 items-center py-2">
          <!-- Name + Rank -->
          <div :class="[type === 'legislative' ? 'col-span-6' : 'col-span-8', 'flex items-center gap-3 px-4']">
             <div class="flex-shrink-0">
                <UAvatar
                  :src="useCmsImage(row.logo)"
                  :alt="row.name"
                  size="xs"
                  :ui="{ rounded: 'rounded-md' }"
                  class="bg-gray-100 dark:bg-gray-800"
                />
             </div>
             <div class="min-w-0">
               <h3 class="line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">
                 {{ sortConfig.field === 'voix' && sortConfig.direction === 'desc' ? `${idx + 1} • ` : '' }}{{ row.acronym || row.name }}
               </h3>
               <p v-if="row.head_of_list" class="text-[10px] text-gray-500 truncate hidden sm:block">
                  {{ row.head_of_list.first_name }} {{ row.head_of_list.last_name }}
               </p>
               <p v-else class="text-[10px] text-gray-500 truncate hidden sm:block">
                  {{ row.name }}
               </p>
             </div>
          </div>

          <!-- Voix & % Stacked -->
          <div :class="[type === 'legislative' ? 'col-span-3' : 'col-span-4', 'px-4 text-right']">
                <div class="flex flex-col items-end">
                    <span class="text-xs font-bold text-gray-900 dark:text-white">{{ row.voixDisplay }}</span>
                    <UBadge variant="subtle" size="xs" :color="row.rawPourcentage > 10 ? 'primary' : 'gray'" class="mt-0.5 scale-90 origin-right">
                        {{ row.pourcentageDisplay }}
                    </UBadge>
                </div>
          </div>

          <!-- Total Seats (Legislative Only) -->
          <div v-if="type === 'legislative'" class="col-span-3 px-4 text-right">
             <div class="flex flex-col items-end">
                <UBadge v-if="row.totalSieges > 0" color="gray" variant="solid" size="xs" class="font-bold">{{ row.totalSieges }}</UBadge>
                <span v-else class="text-gray-300 text-xs">-</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
