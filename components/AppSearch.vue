<template>
  <!-- Mobile: Icône qui ouvre un modal -->
  <div class="flex items-center">
    <!-- Mobile: Bouton icône -->
    <UButton
      class="text-white hover:text-gray-200 md:hidden"
      color="white"
      variant="ghost"
      size="sm"
      icon="i-heroicons-magnifying-glass"
      @click="openMobileSearch"
      aria-label="Rechercher"
    />
    
    <!-- Desktop: Barre de recherche compacte -->
    <div class="hidden md:flex items-center">
      <!-- Version compacte par défaut -->
      <div v-if="!isExpanded" class="relative">
        <UButton
          color="white"
          variant="ghost"
          size="sm"
          icon="i-heroicons-magnifying-glass"
          @click="expandSearch"
          class="text-white hover:text-gray-200"
          aria-label="Rechercher"
        />
      </div>
      
      <!-- Version étendue au focus -->
      <div v-else class="relative w-80">
        <UInput
          ref="searchInput"
          v-model="quickSearchQuery"
          size="sm"
          placeholder="Rechercher..."
          icon="i-heroicons-magnifying-glass"
          :ui="{
            wrapper: 'relative',
            base: 'relative',
            rounded: 'rounded-lg',
            placeholder: 'placeholder-gray-400'
          }"
          class="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-white/70"
          @blur="collapseSearch"
          @keyup.enter="performQuickSearch"
          @keyup.escape="collapseSearch"
        />
        
        <!-- Suggestions rapides -->
        <div 
          v-if="quickSearchQuery && quickSearchResults.length > 0"
          class="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-80 overflow-y-auto"
        >
          <div class="p-2">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
              Suggestions
            </p>
            <NuxtLink
              v-for="result in quickSearchResults.slice(0, 5)"
              :key="result.document?.id"
              :to="result.formattedUrl || '/actualites'"
              class="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="collapseSearch"
            >
              <UIcon 
                :name="result.document?.type === 'document' ? 'i-heroicons-document-text' : 'i-heroicons-newspaper'" 
                class="text-gray-400 dark:text-gray-500 flex-shrink-0" 
                size="16"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ result.document?.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ result.document?.category?.name || 'Actualité' }}
                </p>
              </div>
            </NuxtLink>
            <div class="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
              <NuxtLink
                :to="`/recherche-avancee?q=${encodeURIComponent(quickSearchQuery)}`"
                class="flex items-center gap-2 p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                @click="collapseSearch"
              >
                <UIcon name="i-heroicons-arrow-right" size="16" />
                Voir tous les résultats
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal mobile -->
    <UModal v-model="isMobileSearchOpen" :ui="{ width: 'w-full max-w-full', height: 'h-full max-h-full' }">
      <div class="flex flex-col h-full">
        <!-- Header du modal -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Recherche
          </h2>
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            @click="closeMobileSearch"
            aria-label="Fermer"
          />
        </div>
        
        <!-- Zone de recherche mobile -->
        <div class="flex-1 p-4 overflow-y-auto">
          <UInput
            v-model="mobileSearchQuery"
            size="lg"
            placeholder="Que recherchez-vous ?"
            icon="i-heroicons-magnifying-glass"
            class="mb-4"
            @keyup.enter="performMobileSearch"
            autofocus
          />
          
          <!-- Recherches rapides populaires -->
          <div class="mb-6">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Recherches populaires
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="suggestion in ['Budget 2024', 'Assemblée Nationale', 'Élections', 'Décrets']"
                :key="suggestion"
                @click="mobileSearchQuery = suggestion; performMobileSearch()"
                size="xs"
                color="gray"
                variant="soft"
                class="text-xs"
              >
                {{ suggestion }}
              </UButton>
            </div>
          </div>
          
          <!-- Filtres rapides -->
          <div class="mb-6">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Filtrer par type
            </p>
            <div class="grid grid-cols-2 gap-3">
              <NuxtLink
                to="/recherche-avancee?types=actualite"
                class="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                @click="closeMobileSearch"
              >
                <UIcon name="i-heroicons-newspaper" class="text-blue-600 dark:text-blue-400" />
                <span class="text-sm font-medium text-blue-900 dark:text-blue-100">Actualités</span>
              </NuxtLink>
              <NuxtLink
                to="/recherche-avancee?types=document"
                class="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                @click="closeMobileSearch"
              >
                <UIcon name="i-heroicons-document-text" class="text-orange-600 dark:text-orange-400" />
                <span class="text-sm font-medium text-orange-900 dark:text-orange-100">Documents</span>
              </NuxtLink>
            </div>
          </div>
          
          <!-- Résultats de recherche mobile -->
          <div v-if="mobileSearchQuery && mobileSearchResults.length > 0" class="space-y-3">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Résultats
            </p>
            <NuxtLink
              v-for="result in mobileSearchResults.slice(0, 8)"
              :key="result.document?.id"
              :to="result.formattedUrl || '/actualites'"
              class="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              @click="closeMobileSearch"
            >
              <UIcon 
                :name="result.document?.type === 'document' ? 'i-heroicons-document-text' : 'i-heroicons-newspaper'" 
                class="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" 
                size="16"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                  {{ result.document?.title }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ result.document?.category?.name || 'Actualité' }}
                </p>
              </div>
            </NuxtLink>
            
            <NuxtLink
              :to="`/recherche-avancee?q=${encodeURIComponent(mobileSearchQuery)}`"
              class="flex items-center justify-center gap-2 p-3 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              @click="closeMobileSearch"
            >
              <UIcon name="i-heroicons-arrow-right" size="16" />
              Voir tous les résultats ({{ mobileSearchResults.length }}+)
            </NuxtLink>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const router = useRouter();

// États
const isExpanded = ref(false);
const isMobileSearchOpen = ref(false);
const quickSearchQuery = ref('');
const mobileSearchQuery = ref('');
const quickSearchResults = ref([]);
const mobileSearchResults = ref([]);
const searchInput = ref();

// Recherche rapide avec debounce pour desktop
const quickSearch = useDebounceFn(async () => {
  if (!quickSearchQuery.value.trim()) {
    quickSearchResults.value = [];
    return;
  }
  
  try {
    const { data } = await $fetch('/api/search', {
      query: {
        q: quickSearchQuery.value,
        limit: 8
      }
    });
    
    quickSearchResults.value = data?.data || [];
  } catch (error) {
    console.error('Erreur recherche rapide:', error);
    quickSearchResults.value = [];
  }
}, 200);

// Recherche mobile avec debounce
const mobileSearch = useDebounceFn(async () => {
  if (!mobileSearchQuery.value.trim()) {
    mobileSearchResults.value = [];
    return;
  }
  
  try {
    const { data } = await $fetch('/api/search', {
      query: {
        q: mobileSearchQuery.value,
        limit: 10
      }
    });
    
    mobileSearchResults.value = data?.data || [];
  } catch (error) {
    console.error('Erreur recherche mobile:', error);
    mobileSearchResults.value = [];
  }
}, 200);

// Watchers pour les recherches en temps réel
watch(quickSearchQuery, quickSearch);
watch(mobileSearchQuery, mobileSearch);

// Fonctions pour desktop
const expandSearch = async () => {
  isExpanded.value = true;
  await nextTick();
  searchInput.value?.$el?.querySelector('input')?.focus();
};

const collapseSearch = () => {
  setTimeout(() => {
    isExpanded.value = false;
    quickSearchQuery.value = '';
    quickSearchResults.value = [];
  }, 150);
};

const performQuickSearch = () => {
  if (quickSearchQuery.value.trim()) {
    router.push(`/recherche-avancee?q=${encodeURIComponent(quickSearchQuery.value)}`);
    collapseSearch();
  }
};

// Fonctions pour mobile
const openMobileSearch = () => {
  isMobileSearchOpen.value = true;
};

const closeMobileSearch = () => {
  isMobileSearchOpen.value = false;
  mobileSearchQuery.value = '';
  mobileSearchResults.value = [];
};

const performMobileSearch = () => {
  if (mobileSearchQuery.value.trim()) {
    router.push(`/recherche-avancee?q=${encodeURIComponent(mobileSearchQuery.value)}`);
    closeMobileSearch();
  }
};

// Gérer la fermeture avec Escape
onKeyStroke('Escape', () => {
  if (isMobileSearchOpen.value) {
    closeMobileSearch();
  } else if (isExpanded.value) {
    collapseSearch();
  }
});
</script>

<style scoped>
/* Styles pour les animations et transitions */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>