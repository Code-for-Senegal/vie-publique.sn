<script setup lang="ts">
const { treeRoots, pending } = useEtatOrganisation();

// Expand all state via provide/inject
const expandAll = ref(false);
const collapseAll = ref(false);

const handleCollapseAll = () => {
  collapseAll.value = true;
  expandAll.value = false;
  nextTick(() => {
    collapseAll.value = false;
  });
};

provide('treeExpandAll', expandAll);
provide('treeCollapseAll', collapseAll);
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div class="mb-3 flex justify-end gap-2">
      <button
        class="text-xs text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
        @click="handleCollapseAll"
      >
        Tout replier
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex flex-col items-center gap-3 py-12">
      <UIcon name="i-heroicons-arrow-path" class="h-7 w-7 animate-spin text-emerald-500" />
      <p class="text-sm text-gray-500">Chargement de l'organigramme…</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!treeRoots.length"
      class="rounded-xl border border-gray-200 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-800/50"
    >
      <UIcon name="i-heroicons-building-office" class="mx-auto mb-2 h-10 w-10 text-gray-300" />
      <p class="text-sm text-gray-500">Aucune donnée disponible.</p>
    </div>

    <!-- Tree -->
    <div
      v-else
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
    >
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
