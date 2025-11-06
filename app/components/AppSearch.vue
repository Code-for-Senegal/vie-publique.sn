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
      aria-label="Rechercher"
      @click="openMobileSearch"
    />

    <!-- Desktop: Barre de recherche compacte -->
    <div class="hidden items-center md:flex">
      <!-- Version compacte par défaut -->
      <div v-if="!isExpanded" class="relative">
        <UButton
          color="white"
          variant="ghost"
          size="sm"
          icon="i-heroicons-magnifying-glass"
          class="text-white hover:text-gray-200"
          aria-label="Rechercher"
          @click="expandSearch"
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
            placeholder: 'placeholder-gray-400',
          }"
          class="border-white/20 bg-white/10 text-white placeholder-white/70 backdrop-blur-sm"
          @blur="collapseSearch"
          @keyup.enter="performQuickSearch"
          @keyup.escape="collapseSearch"
        />

        <!-- Suggestions rapides -->
        <div
          v-if="quickSearchQuery && quickSearchResults.length > 0"
          class="absolute top-full z-50 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="p-2">
            <p class="mb-2 px-2 text-xs text-gray-500 dark:text-gray-400">Suggestions</p>
            <NuxtLink
              v-for="result in quickSearchResults.slice(0, 5)"
              :key="result.document?.id"
              :to="result.formattedUrl || '/actualites'"
              class="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              @click="collapseSearch"
            >
              <UIcon
                :name="
                  result.document?.type === 'document'
                    ? 'i-heroicons-document-text'
                    : 'i-heroicons-newspaper'
                "
                class="flex-shrink-0 text-gray-400 dark:text-gray-500"
                size="16"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {{ result.document?.title }}
                </p>
                <p class="truncate text-xs text-gray-500 dark:text-gray-400">
                  {{ result.document?.category?.name || 'Actualité' }}
                </p>
              </div>
            </NuxtLink>
            <div class="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
              <NuxtLink
                :to="`/recherche?q=${encodeURIComponent(quickSearchQuery)}`"
                class="flex items-center gap-2 rounded-md p-2 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
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
    <UModal
      v-model="isMobileSearchOpen"
      :ui="{ width: 'w-full max-w-full', height: 'h-full max-h-full' }"
    >
      <div class="flex h-full flex-col">
        <!-- Header du modal -->
        <div
          class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
        >
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recherche</h2>
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            aria-label="Fermer"
            @click="closeMobileSearch"
          />
        </div>

        <!-- Zone de recherche mobile -->
        <div class="flex-1 overflow-y-auto p-4">
          <UInput
            v-model="mobileSearchQuery"
            size="lg"
            placeholder="Que recherchez-vous ?"
            icon="i-heroicons-magnifying-glass"
            class="mb-4"
            autofocus
            @keyup.enter="performMobileSearch"
          />

          <!-- Recherches rapides populaires -->
          <div class="mb-6">
            <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Recherches populaires
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="suggestion in ['Budget 2024', 'Assemblée Nationale', 'Élections', 'Décrets']"
                :key="suggestion"
                size="xs"
                color="gray"
                variant="soft"
                class="text-xs"
                @click="
                  mobileSearchQuery = suggestion;
                  performMobileSearch();
                "
              >
                {{ suggestion }}
              </UButton>
            </div>
          </div>

          <!-- Filtres rapides -->
          <div class="mb-6">
            <p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrer par type
            </p>
            <div class="grid grid-cols-2 gap-3">
              <NuxtLink
                to="/recherche?types=actualite"
                class="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                @click="closeMobileSearch"
              >
                <UIcon name="i-heroicons-newspaper" class="text-blue-600 dark:text-blue-400" />
                <span class="text-sm font-medium text-blue-900 dark:text-blue-100">Actualités</span>
              </NuxtLink>
              <NuxtLink
                to="/recherche?types=document"
                class="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 transition-colors hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
                @click="closeMobileSearch"
              >
                <UIcon
                  name="i-heroicons-document-text"
                  class="text-orange-600 dark:text-orange-400"
                />
                <span class="text-sm font-medium text-orange-900 dark:text-orange-100"
                  >Documents</span
                >
              </NuxtLink>
            </div>
          </div>

          <!-- Résultats de recherche mobile -->
          <div v-if="mobileSearchQuery && mobileSearchResults.length > 0" class="space-y-3">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Résultats</p>
            <NuxtLink
              v-for="result in mobileSearchResults.slice(0, 8)"
              :key="result.document?.id"
              :to="result.formattedUrl || '/actualites'"
              class="flex items-start gap-3 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
              @click="closeMobileSearch"
            >
              <UIcon
                :name="
                  result.document?.type === 'document'
                    ? 'i-heroicons-document-text'
                    : 'i-heroicons-newspaper'
                "
                class="mt-1 flex-shrink-0 text-gray-400 dark:text-gray-500"
                size="16"
              />
              <div class="min-w-0 flex-1">
                <p class="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                  {{ result.document?.title }}
                </p>
                <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ result.document?.category?.name || 'Actualité' }}
                </p>
              </div>
            </NuxtLink>

            <NuxtLink
              :to="`/recherche?q=${encodeURIComponent(mobileSearchQuery)}`"
              class="flex items-center justify-center gap-2 rounded-lg border border-blue-200 p-3 text-sm text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
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
        limit: 8,
      },
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
        limit: 10,
      },
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
    router.push(`/recherche?q=${encodeURIComponent(quickSearchQuery.value)}`);
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
    router.push(`/recherche?q=${encodeURIComponent(mobileSearchQuery.value)}`);
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
