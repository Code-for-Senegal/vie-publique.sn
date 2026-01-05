<script setup lang="ts">
import type { Coalition } from "~~/types/coalition";

interface Props {
  coalitions: Coalition[];
  type?: string;
}

const props = defineProps<Props>();

const columns = computed(() => {
  const baseCols = [
    { key: "rank", label: "Rang" },
    { key: "name", label: "Coalition / Candidat" },
    { key: "voix", label: "Voix", sortable: true },
    { key: "pourcentage", label: "%", sortable: true },
  ];

  if (props.type === "legislative") {
    baseCols.push({ key: "sieges", label: "Sièges", sortable: true });
  }

  return baseCols;
});

const rows = computed(() => {
  // 1. Sort by votes descending
  const sorted = [...props.coalitions].sort((a, b) => {
      const vA = Number(a.voix) || 0;
      const vB = Number(b.voix) || 0;
      return vB - vA;
  });

  // 2. Map to display format
  return sorted.map((c, index) => {
    let siegesCount = c.sieges || 0;
    
    // pour legislative, sum seats + seats_department
    if (props.type === 'legislative') {
        const seatsNational = Number(c.sieges) || 0; 
        const seatsDept = Number((c as any).sieges_departement) || 0;
        siegesCount = seatsNational + seatsDept;
    }

    return {
        ...c,
        rank: index + 1,
        pourcentage: c.pourcentage ? `${parseFloat(c.pourcentage).toFixed(2)}%` : '-',
        voix: c.voix ? new Intl.NumberFormat('fr-FR').format(c.voix) : '-',
        sieges: siegesCount // Use the calculated sum
    };
  });
});
</script>

<template>
  <UCard :ui="{ body: { padding: 'p-0 sm:p-0' } }">
    <UTable 
      :columns="columns" 
      :rows="rows"
      :ui="{
        th: { base: 'whitespace-nowrap' },
        td: { base: 'whitespace-nowrap' }
      }"
    >
      <template #name-data="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar 
            :src="row.logo" 
            :alt="row.name" 
            size="xs"
            :ui="{ rounded: 'rounded-md' }"
            class="bg-gray-100"
          />
          <div class="flex flex-col">
            <span class="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px] sm:max-w-[250px]">{{ row.name }}</span>
            <span v-if="row.heat_of_list" class="text-xs text-gray-500 hidden sm:inline">
              {{ row.head_of_list.first_name }} {{ row.head_of_list.last_name }}
            </span>
          </div>
        </div>
      </template>

      <template #rank-data="{ row }">
        <UBadge variant="subtle" color="gray" class="rounded-full w-6 h-6 flex items-center justify-center p-0">
          {{ row.rank }}
        </UBadge>
      </template>
      
      <template #pourcentage-data="{ row }">
        <span class="font-medium font-mono text-primary-600 dark:text-primary-400">{{ row.pourcentage }}</span>
      </template>

      <template #sieges-data="{ row }">
        <UBadge v-if="row.sieges > 0" color="primary" variant="solid">{{ row.sieges }}</UBadge>
        <span v-else class="text-gray-400">-</span>
      </template>

    </UTable>
  </UCard>
</template>
