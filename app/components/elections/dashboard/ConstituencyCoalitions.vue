<script setup lang="ts">
import { useElectoralDashboardLists } from '~/composables/elections/dashboard/useElectoralDashboardLists';

const props = defineProps<{
  constituencyId: string | number;
  constituencyName: string;
  year: number;
  type: string;
}>();

const emit = defineEmits(['close', 'selectCoalition']);

const route = useRoute();
const router = useRouter();
const selectedCommuneId = ref<string | number | null>(route.query.commune_id ? String(route.query.commune_id) : null);

const { lists, loading } = useElectoralDashboardLists({
  year: computed(() => props.year),
  type: computed(() => props.type),
  constituencyId: computed(() => props.constituencyId)
});

const communes = computed(() => {
  if (!lists.value) return [];
  const uniqueCommunes = new Map();
  lists.value.forEach((list: any) => {
    if (list.constituency && (list.constituency.type === 'commune' || list.constituency.nationale_type === 'commune')) {
      uniqueCommunes.set(list.constituency.id, list.constituency.name);
    }
  });
  return Array.from(uniqueCommunes.entries())
    .map(([id, name]) => ({ id, name, label: name }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

watch(selectedCommuneId, (newId) => {
    const query = { ...route.query };
    if (newId) {
        query.commune_id = String(newId);
    } else {
        delete query.commune_id;
    }
    router.replace({ query });
});

const filteredLists = computed(() => {
  if (!lists.value) return [];
  
  let result = lists.value.filter((l: any) => {
      if (l.constituency?.type === 'departement' || l.constituency?.nationale_type === 'departement') return false; 
      return true;
  });

  if (selectedCommuneId.value) {
    result = result.filter((l: any) => l.constituency?.id == selectedCommuneId.value);
  }
  return result;
});

const uniqueCoalitions = computed(() => {
    if (!filteredLists.value) return [];
    
    const map = new Map();
    filteredLists.value.forEach((list: any) => {
        const key = selectedCommuneId.value 
            ? list.coalition.id 
            : `${list.coalition.id}-${list.constituency?.id}`;
            
        if (list.coalition && !map.has(key)) {
            map.set(key, list);
        }
    });
    return Array.from(map.values());
});

watch(() => props.constituencyId, () => {
    selectedCommuneId.value = null;
});

const selectCoalition = (list: any) => {
    if (list.coalition?.id) {
        const targetConstituencyId = selectedCommuneId.value || list.constituency?.id || props.constituencyId;
        
        emit('selectCoalition', {
            coalitionId: list.coalition.id,
            constituencyId: targetConstituencyId
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
                {{ uniqueCoalitions.length }} listes en lice
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
                       <span v-if="selectedCommuneId" class="truncate">{{ communes.find(c => c.id == selectedCommuneId)?.label }}</span>
                       <span v-else class="text-gray-400">Toutes les communes</span>
                   </template>
               </USelectMenu>
          </div>
      </div>
    </div>

    <!-- Loading -->
    <ElectionsDashboardCoalitionGridLoadingState v-if="loading" />

    <!-- Grille des Listes -->
    <div v-else-if="uniqueCoalitions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="list in uniqueCoalitions" 
        :key="list.coalition?.id || list.id"
        class="group relative bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all cursor-pointer shadow-sm hover:shadow-lg"
        @click="selectCoalition(list)"
      >
         <div class="p-6 flex items-center gap-5">
             <UAvatar 
                :src="list.coalition?.logo ? '' : ''"
                :alt="list.coalition?.name" 
                size="xl"
                class="bg-gray-50 dark:bg-gray-800 ring-2 ring-gray-100 dark:ring-gray-800"
             />
             <div>
                 <p class="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">
                       {{ list.constituency?.name }}
                 </p>
                 <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">
                     {{ list.coalition?.name || list.name }}
                 </h3>
             </div>
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
