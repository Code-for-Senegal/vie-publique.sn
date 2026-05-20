<script setup lang="ts">
const { treeRoots, pending, overview, entities } = useEtatOrganisation()

const totalCount = computed(() => entities.value.length)

// Expand all state via provide/inject
const expandAll = ref(false)
const collapseAll = ref(false)

const handleExpandAll = () => {
  expandAll.value = true
  collapseAll.value = false
  nextTick(() => { expandAll.value = false })
}

const handleCollapseAll = () => {
  collapseAll.value = true
  expandAll.value = false
  nextTick(() => { collapseAll.value = false })
}

provide('treeExpandAll', expandAll)
provide('treeCollapseAll', collapseAll)

// Stats from overview for the 4 main types
const STAT_TYPES = ['ministere', 'etablissement_public', 'societe_nationale', 'societe_participation_publique']
const TYPE_ICONS: Record<string, string> = {
  ministere: 'i-heroicons-building-office',
  etablissement_public: 'i-heroicons-academic-cap',
  societe_nationale: 'i-heroicons-building-storefront',
  societe_participation_publique: 'i-heroicons-building-storefront',
}
const TYPE_COLORS: Record<string, string> = {
  ministere: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  etablissement_public: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  societe_nationale: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  societe_participation_publique: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

const typeStats = computed(() => {
  const counts = new Map<string, number>()
  const labels = new Map<string, string>()
  for (const entity of entities.value) {
    if (STAT_TYPES.includes(entity.type_code)) {
      counts.set(entity.type_code, (counts.get(entity.type_code) || 0) + 1)
      if (!labels.has(entity.type_code)) labels.set(entity.type_code, entity.type_label)
    }
  }
  return STAT_TYPES
    .filter(code => counts.has(code))
    .map(code => ({
      code,
      label: labels.get(code) || code,
      count: counts.get(code) || 0,
      icon: TYPE_ICONS[code] || 'i-heroicons-building-office',
      color: TYPE_COLORS[code] || 'bg-gray-100 text-gray-600',
    }))
})
</script>

<template>
  <div>
    <!-- Stats cards -->
    <div v-if="typeStats.length" class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div
        v-for="stat in typeStats"
        :key="stat.code"
        class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="stat.color">
          <UIcon :name="stat.icon" class="h-5 w-5" />
        </span>
        <div class="min-w-0">
          <p class="text-lg font-bold leading-none text-gray-900 dark:text-white">{{ stat.count }}</p>
          <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="mb-3 flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        <span class="font-semibold text-gray-900 dark:text-white">{{ totalCount }}</span>
        entités au total
      </p>
      <div class="flex items-center gap-2">
        <button
          class="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
          @click="handleExpandAll"
        >
          Tout déplier
        </button>
        <span class="text-gray-300 dark:text-gray-600">·</span>
        <button
          class="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
          @click="handleCollapseAll"
        >
          Tout replier
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center gap-3 py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-7 w-7 animate-spin text-emerald-500" />
      <p class="text-sm text-gray-500">Chargement de l'organigramme…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!treeRoots.length" class="rounded-xl border border-gray-200 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-900">
      <UIcon name="i-heroicons-building-office" class="mx-auto mb-2 h-10 w-10 text-gray-300" />
      <p class="text-sm text-gray-500">Aucune donnée disponible.</p>
    </div>

    <!-- Tree -->
    <div v-else class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <EtatOrganisationTreeItem
        v-for="root in treeRoots"
        :key="root.id"
        :node="root"
        :depth="0"
        class="border-b border-gray-100 last:border-0 dark:border-gray-800"
      />
    </div>
  </div>
</template>
