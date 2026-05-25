<script setup lang="ts">
const { overview, allDecrees, selectedDecreeNumero } = useEtatOrganisation()

const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => (route.query.view as 'tree' | 'list') || 'tree',
  set: (v: 'tree' | 'list') =>
    router.push({
      query: { ...route.query, view: v === 'tree' ? undefined : v },
    }),
})

const tabs = [
  { key: 'tree' as const, label: 'Arborescence', icon: 'i-heroicons-rectangle-group' },
  { key: 'list' as const, label: 'Liste', icon: 'i-heroicons-list-bullet' },
]

// The numero of the active (default) decree
const activeNumero = computed(() => overview.value?.decree?.numero ?? '')

// What is currently displayed - falls back to active
const displayedNumero = computed(() => selectedDecreeNumero.value || activeNumero.value)

const isHistoricView = computed(
  () => !!selectedDecreeNumero.value && selectedDecreeNumero.value !== activeNumero.value,
)

const onDecreeChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value
  selectedDecreeNumero.value = val === activeNumero.value ? '' : val
}
</script>

<template>
  <section id="explorer" class="mx-auto max-w-7xl">

    <!-- Historic view notice -->
    <div
      v-if="isHistoricView"
      class="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
    >
      <UIcon name="i-heroicons-clock" class="h-4 w-4 shrink-0" />
      <span>Vue archivée - décret n°&nbsp;<strong>{{ displayedNumero }}</strong>.</span>
      <button
        class="ml-auto text-xs underline underline-offset-2"
        @click="selectedDecreeNumero = ''"
      >
        Retour au décret actif
      </button>
    </div>

    <!-- Tab switcher -->
    <div class="mb-5 flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800/60">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-150"
        :class="
          activeTab === tab.key
            ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        "
        @click="activeTab = tab.key"
      >
        <UIcon :name="tab.icon" class="h-4 w-4" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tree view -->
    <div v-if="activeTab === 'tree'">
      <EtatOrganisationTree />
    </div>

    <!-- List view -->
    <div v-else>
      <EtatOrganisationList />
    </div>
  </section>
</template>
