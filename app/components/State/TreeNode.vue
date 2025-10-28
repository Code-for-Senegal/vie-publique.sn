<script setup lang="ts">
import type { StateEntityTreeNode } from '~/types/state-entity';

interface Props {
  node: StateEntityTreeNode;
  isExpanded: boolean;
  level?: number;
}

const props = withDefaults(defineProps<Props>(), {
  level: 0,
});

const emit = defineEmits<{
  toggle: [nodeId: number];
}>();

// Padding basé sur le niveau
const paddingLeft = computed(() => `${props.level * 1.5}rem`);

const hasChildren = computed(() => props.node.children && props.node.children.length > 0);

const handleToggle = () => {
  if (hasChildren.value) {
    emit('toggle', props.node.id);
  }
};

// Affichage du nom
const displayName = computed(() => {
  if (props.node.acronym) {
    return `${props.node.name} (${props.node.acronym})`;
  }
  return props.node.name;
});
</script>

<template>
  <div class="tree-node">
    <!-- Noeud actuel -->
    <div
      class="flex cursor-pointer items-center gap-2 rounded px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
      :style="{ paddingLeft }"
      @click="handleToggle"
    >
      <!-- Icône d'expansion -->
      <button
        v-if="hasChildren"
        type="button"
        class="flex h-5 w-5 flex-shrink-0 items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <UIcon
          :name="isExpanded ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
          class="h-4 w-4"
        />
      </button>
      <div v-else class="h-5 w-5 flex-shrink-0" />

      <!-- Type badge -->
      <StateEntityTypeBadge :type="node.type" />

      <!-- Nom avec lien -->
      <NuxtLink
        :to="`/etat-senegal/annuaire/${node.public_slug}`"
        class="hover:text-primary-600 dark:hover:text-primary-400 flex-1 truncate text-sm font-medium text-gray-900 dark:text-white"
        @click.stop
      >
        {{ displayName }}
      </NuxtLink>

      <!-- Nombre d'enfants -->
      <span v-if="hasChildren" class="text-xs text-gray-500 dark:text-gray-400">
        ({{ node.children.length }})
      </span>

      <!-- Responsable -->
      <span
        v-if="node.director_name"
        class="max-w-xs truncate text-xs text-gray-500 dark:text-gray-400"
      >
        {{ node.director_name }}
      </span>
    </div>

    <!-- Enfants -->
    <div v-if="hasChildren && isExpanded" class="children">
      <StateTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :is-expanded="isExpanded"
        :level="level + 1"
        @toggle="emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.tree-node {
  @apply border-l border-gray-200 dark:border-gray-700;
}
</style>
