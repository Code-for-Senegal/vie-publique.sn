<script setup lang="ts">
import { useElectoralDashboardLists } from '~/composables/elections/dashboard/useElectoralDashboardLists';
import { useElectoralFormatting } from '~/composables/elections/dashboard/useElectoralFormatting';

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
  constituencyId: computed(() => String(props.constituencyId))
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

const searchQuery = ref('');

const filteredLists = computed(() => {
  if (!lists.value) return [];
  
  let result = lists.value.filter((l: any) => {
      if (l.constituency?.type === 'departement' || l.constituency?.nationale_type === 'departement') return false; 
      return true;
  });

  if (selectedCommuneId.value) {
    result = result.filter((l: any) => l.constituency?.id == selectedCommuneId.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((l: any) => 
      l.coalition?.name?.toLowerCase().includes(q) || 
      l.coalition?.acronym?.toLowerCase().includes(q)
    );
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
    <div class="sticky top-[80px] md:top-[124px] z-40 bg-gray-50/95 backdrop-blur-md dark:bg-gray-950/95 py-4 -mx-4 px-4 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <UButton
                icon="i-heroicons-arrow-left"
                color="gray"
                variant="soft"
                size="sm"
                class="rounded-xl mt-1 shrink-0"
                @click="emit('close')"
            >
                <span class="hidden sm:inline">Retour</span>
            </UButton>
            <div>
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <UIcon name="i-heroicons-map-pin" class="h-4 w-4 text-primary-600" />
                  </div>
                  <h2 class="text-xl md:text-2xl font-black uppercase tracking-tighter">
                      {{ constituencyName }}
                  </h2>
                </div>
                <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                  {{ uniqueCoalitions.length }} listes en lice au total
                </p>
            </div>
          </div>

          <!-- Search & Filters -->
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div class="w-full md:w-64">
                <UInput
                  v-model="searchQuery"
                  icon="i-heroicons-magnifying-glass"
                  placeholder="Rechercher une liste..."
                  size="sm"
                  class="w-full"
                  :ui="{ rounded: 'rounded-xl' }"
                />
              </div>
              <!-- Commune Selector -->
              <div v-if="communes.length > 0" class="w-full md:w-64">
                   <USelectMenu
                     v-model="selectedCommuneId"
                     :options="communes"
                     value-attribute="id"
                     option-attribute="label"
                     placeholder="Toutes les communes"
                     searchable
                     clearable
                     size="sm"
                     :ui="{ rounded: 'rounded-xl' }"
                   >
                       <template #label>
                           <span v-if="selectedCommuneId" class="truncate">{{ communes.find(c => c.id == selectedCommuneId)?.label }}</span>
                           <span v-else class="text-gray-400">Toutes les communes</span>
                       </template>
                   </USelectMenu>
              </div>
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
             <div class="h-14 w-14 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl p-2 border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                 <CmsImage v-if="list.coalition?.logo" :src="list.coalition.logo" class="max-h-full max-w-full object-contain" :alt="list.coalition?.name" />
                 <UIcon v-else name="i-heroicons-photo" class="text-gray-200 h-8 w-8" />
             </div>
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
