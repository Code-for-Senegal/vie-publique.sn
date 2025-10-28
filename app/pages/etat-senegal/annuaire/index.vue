<script setup lang="ts">
// Composables
const { entities, meta, filters, pending, setSearch, setType, setStatus, setPage, resetFilters } =
  useStateEntities()
const {
  tree,
  pending: treePending,
  expandAll,
  collapseAll,
  toggleNode,
  isExpanded,
} = useStateTree()
const { stats } = useStateStats()

// Onglets
const tabs = [
  { key: 'list', label: 'Liste', icon: 'i-heroicons-list-bullet' },
  { key: 'tree', label: 'Arbre hiérarchique', icon: 'i-heroicons-rectangle-group' },
]

const route = useRoute()
const router = useRouter()
const activeTab = ref((route.query.view as string) || 'list')

watch(activeTab, (value) => {
  router.push({ query: { ...route.query, view: value } })
})

// SEO
useSeoMeta({
  title: 'Annuaire des Entités Publiques du Sénégal',
  description:
    "Découvrez l'organisation complète de l'État sénégalais : ministères, directions, agences, sociétés nationales et établissements publics. Base de données officielle mise à jour.",
  ogTitle: 'Annuaire des Entités Publiques du Sénégal',
  ogDescription:
    "Organisation complète de l'État sénégalais avec ministères, agences et établissements publics",
  ogImage: '/og-image.png',
})

useHead({
  title: 'Annuaire des Entités Publiques',
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
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

    <!-- Statistiques -->
    <div v-if="stats" class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      <UCard>
        <div class="text-center">
          <div class="text-primary-600 dark:text-primary-400 text-3xl font-bold">
            {{ stats.total }}
          </div>
          <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Entités totales</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-primary-600 dark:text-primary-400 text-3xl font-bold">
            {{ stats.active_ministries }}
          </div>
          <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Ministères</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-primary-600 dark:text-primary-400 text-3xl font-bold">
            {{ stats.total_agencies }}
          </div>
          <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Agences</div>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <div class="text-primary-600 dark:text-primary-400 text-3xl font-bold">
            {{ stats.total_directions }}
          </div>
          <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Directions</div>
        </div>
      </UCard>
    </div>

    <!-- Onglets -->
    <UTabs v-model="activeTab" :items="tabs" class="mb-6">
      <!-- Onglet Liste -->
      <template #list>
        <div class="space-y-6">
          <!-- Filtres -->
          <StateEntityFilters
            :search="filters.search"
            :type="filters.type"
            :status="filters.status"
            @update:search="setSearch"
            @update:type="setType"
            @update:status="setStatus"
            @reset="resetFilters"
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

            <!-- Grille des entités -->
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      </template>

      <!-- Onglet Arbre -->
      <template #tree>
        <div class="space-y-6">
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
      </template>
    </UTabs>
  </div>
</template>
