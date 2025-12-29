<script setup lang="ts">
import { useElectoralDashboardLists } from '~/composables/elections/dashboard/useElectoralDashboardLists';

const props = defineProps<{
  constituencyId: string | number;
  constituencyName: string;
  year: number;
  type: string;
}>();

const emit = defineEmits(['close', 'selectCoalition']);

const selectedCommuneId = ref<string | number | null>(null);

const { lists, loading } = useElectoralDashboardLists({
  year: computed(() => props.year),
  type: computed(() => props.type),
  constituencyId: computed(() => props.constituencyId)
});

const communes = computed(() => {
  if (!lists.value) return [];
  const uniqueCommunes = new Map();
  lists.value.forEach((list: any) => {
    if (list.constituency && list.constituency.type === 'commune') {
      uniqueCommunes.set(list.constituency.id, list.constituency.name);
    }
  });
  return Array.from(uniqueCommunes.entries()).map(([id, name]) => ({ id, name, label: name }));
});

const filteredLists = computed(() => {
  if (!lists.value) return [];
  if (selectedCommuneId.value) {
    return lists.value.filter((l: any) => l.constituency?.id === selectedCommuneId.value);
  }
  return lists.value;
});

watch(() => props.constituencyId, () => {
    selectedCommuneId.value = null;
});

const selectList = (list: any) => {
    if (list.coalition?.id) {
        emit('selectCoalition', {
            coalitionId: list.coalition.id,
            constituencyId: props.constituencyId
        });
    }
};
</script>

<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <!-- Header avec bouton retour et Filtre -->
    <div class="sticky top-[132px] z-40 bg-[#f8fafc] dark:bg-gray-950 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <UButton
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="ghost"
                size="lg"
                class="rounded-full"
                @click="emit('close')"
            >
                Retour
            </UButton>
            <div>
                <div class="flex items-center gap-2 mb-1">
                <UIcon name="i-heroicons-map-pin" class="h-5 w-5 text-primary-600" />
                <h2 class="text-2xl font-black uppercase tracking-tighter">
                    {{ constituencyName }}
                </h2>
                </div>
                <p class="text-sm text-gray-500">
                {{ filteredLists.length }} listes en lice
                </p>
            </div>
          </div>

          <!-- Commune Selector -->
          <div class="w-full md:w-64" v-if="communes.length > 0">
               <USelectMenu
                 v-model="selectedCommuneId"
                 :options="communes"
                 value-attribute="id"
                 option-attribute="label"
                 placeholder="Filtrer par commune"
                 searchable
                 clearable
               >
                   <template #label>
                       <span v-if="selectedCommuneId" class="truncate">{{ communes.find(c => c.id === selectedCommuneId)?.label }}</span>
                       <span v-else class="text-gray-400">Toutes les communes</span>
                   </template>
               </USelectMenu>
          </div>
      </div>
    </div>

    <!-- Loading -->
    <ElectionsDashboardCoalitionGridLoadingState v-if="loading" />

    <!-- Grille des Listes -->
    <div v-else-if="filteredLists.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="list in filteredLists" 
        :key="list.id"
        class="group relative bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer shadow-sm hover:shadow-lg"
        @click="selectList(list)"
      >
         <!-- Header Card: Logo & Name -->
         <div class="p-4 flex items-center gap-4">
             <UAvatar 
                :src="list.coalition?.logo ? `https://api.vie-publique.sn/assets/${list.coalition.logo}` : ''"
                :alt="list.coalition?.name" 
                size="lg"
                class="bg-gray-50 dark:bg-gray-800"
             />
             <div>
                 <p class="text-xs text-primary-600 font-bold uppercase tracking-wider mb-0.5">{{ list.constituency?.name }}</p>
                 <h3 class="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                     {{ list.coalition?.name || list.name }}
                 </h3>
             </div>
         </div>
         
         <!-- Footer: Candidats Count -->
         <div class="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
             <div class="flex items-center gap-2">
                 <UIcon name="i-heroicons-users" class="w-4 h-4 text-gray-400" />
                 <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ list.candidates?.length || 0 }} candidats</span>
             </div>
             <UIcon name="i-heroicons-chevron-right" class="w-5 h-5 text-gray-300 group-hover:text-primary-500" />
         </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-inner">
      <UIcon name="i-heroicons-user-group" class="h-20 w-20 mx-auto mb-4 text-gray-200 dark:text-gray-800" />
      <h4 class="text-lg font-bold text-gray-400">Aucune liste</h4>
      <p class="text-sm text-gray-500 max-w-xs mx-auto">Aucune liste trouvée pour les filtres sélectionnés.</p>
    </div>
  </div>
</template>
