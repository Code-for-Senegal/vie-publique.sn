<script setup lang="ts">
// Composables
const { entities, meta, filters, pending, setSearch, setType, setPage } =
  useStateEntities();
const {
  tree,
  pending: treePending,
  expandAll,
  collapseAll,
  toggleNode,
  isExpanded,
} = useStateTree();
const { stats } = useStateStats();

const route = useRoute();
const router = useRouter();

// Gestion du tab actif - persiste lors des changements de filtres
const activeTab = ref('list');

// Restaurer depuis l'URL ou sessionStorage
if (import.meta.client) {
  const view = route.query.view as string;
  const savedTab = sessionStorage.getItem('annuaire-active-tab');
  activeTab.value = view || savedTab || 'list';
}

// Synchroniser avec sessionStorage
watch(activeTab, (newTab) => {
  if (import.meta.client) {
    sessionStorage.setItem('annuaire-active-tab', newTab);
    router.push({ query: { ...route.query, view: newTab } });
  }
});

// SEO
useSeoMeta({
  title: 'Annuaire des Entités Publiques du Sénégal',
  description:
    "Découvrez l'organisation complète de l'État sénégalais : ministères, directions, agences, sociétés nationales et établissements publics. Base de données officielle mise à jour.",
  ogTitle: 'Annuaire des Entités Publiques du Sénégal',
  ogDescription:
    "Organisation complète de l'État sénégalais avec ministères, agences et établissements publics",
  ogImage: '/og-image.png',
});

useHead({
  title: 'Annuaire des Entités Publiques',
});
</script>

<template>
  <div class="container mx-auto min-h-screen px-4 py-8 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Annuaire' }
      ]"
    />

    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
        Annuaire des Entités Publiques du Sénégal
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Organisation complète de l'État sénégalais : ministères, directions, agences et
        établissements publics
      </p>
    </div>

    <!-- Statistiques simples -->
    <div v-if="stats" class="mb-6 text-sm text-gray-600 dark:text-gray-400">
      {{ stats.total }} entités publiques
    </div>

    <!-- Boutons de navigation (style tabs) -->
    <div class="mb-6 flex items-center justify-center gap-1 border-b border-gray-200 dark:border-gray-700">
      <button
        :class="[
          'px-4 py-2 text-sm font-medium transition-all',
          activeTab === 'list'
            ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
            : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
        ]"
        @click="activeTab = 'list'"
      >
        Liste
      </button>
      <button
        :class="[
          'px-4 py-2 text-sm font-medium transition-all',
          activeTab === 'tree'
            ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
            : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300',
        ]"
        @click="activeTab = 'tree'"
      >
        Arbre hiérarchique
      </button>
    </div>

    <!-- Contenu des onglets -->
    <div>
      <!-- Onglet Liste -->
      <div v-show="activeTab === 'list'" class="space-y-6">
          <!-- Filtres -->
          <StateEntityFilters
            :search="String(filters.search || '')"
            :type="filters.type"
            @update:search="setSearch"
            @update:type="setType"
          />

          <!-- Résultats -->
          <div v-if="pending" class="py-12 text-center">
            <UIcon name="i-heroicons-arrow-path" class="text-primary-600 h-8 w-8 animate-spin" />
            <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>

          <div v-else-if="entities.length === 0" class="py-12 text-center">
            <UIcon name="i-heroicons-folder-open" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p class="text-gray-600 dark:text-gray-400">Aucune entité trouvée</p>
          </div>

          <div v-else class="space-y-6">
            <!-- Métadonnées -->
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{{ meta?.filter_count }} entité(s) trouvée(s)</span>
              <span>Page {{ meta?.page }} sur {{ meta?.total_pages }}</span>
            </div>

            <!-- Liste des entités (1 colonne - vraie liste) -->
            <div class="space-y-3">
              <StateEntityCard
                v-for="entity in entities"
                :key="entity.id"
                :entity="entity"
                :show-parent="true"
              />
            </div>

            <!-- Pagination -->
            <div v-if="meta && meta.total_pages > 1" class="flex justify-center">
              <UPagination
                :model-value="meta.page"
                :total="meta.filter_count"
                :page-count="meta.limit"
                show-first
                show-last
                @update:model-value="setPage"
              />
            </div>
          </div>
      </div>

      <!-- Onglet Arbre -->
      <div v-show="activeTab === 'tree'" class="space-y-6">
        <!-- Actions -->
        <div class="flex gap-3">
          <UButton
            color="gray"
            variant="outline"
            icon="i-heroicons-plus-circle"
            @click="expandAll"
          >
            Tout déplier
          </UButton>
          <UButton
            color="gray"
            variant="outline"
            icon="i-heroicons-minus-circle"
            @click="collapseAll"
          >
            Tout replier
          </UButton>
        </div>

        <!-- Arbre -->
        <UCard v-if="treePending" class="py-12 text-center">
          <UIcon
            name="i-heroicons-arrow-path"
            class="text-primary-600 mx-auto h-8 w-8 animate-spin"
          />
          <p class="mt-2 text-gray-600 dark:text-gray-400">Chargement de l'arbre...</p>
        </UCard>

        <UCard v-else-if="!tree || tree.length === 0" class="py-12 text-center">
          <UIcon name="i-heroicons-folder-open" class="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <p class="text-gray-600 dark:text-gray-400">Aucune donnée disponible</p>
        </UCard>

        <UCard v-else>
          <div class="space-y-1">
            <StateTreeNode
              v-for="node in tree"
              :key="node.id"
              :node="node"
              :is-expanded="isExpanded(node.id)"
              :level="0"
              @toggle="toggleNode"
            />
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
