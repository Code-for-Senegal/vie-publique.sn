<script setup lang="ts">
const { overview } = useEtatOrganisation()

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
</script>

<template>
  <section id="explorer" class="mx-auto max-w-7xl">

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
