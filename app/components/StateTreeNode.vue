<script setup lang="ts">
const props = defineProps<{
  node: any
  isExpanded: boolean
  level: number
}>()

const emit = defineEmits<{
  toggle: [nodeId: string]
}>()

// Indentation basée sur le niveau
const paddingLeft = computed(() => `${props.level * 1.5}rem`)

// L'entité est cliquable si has_public_page = true
const isClickable = computed(() => props.node.has_public_page === true)

// Les groupes ne sont jamais cliquables
const isGroup = computed(() => props.node.is_group === true)

const handleToggle = () => {
  if (props.node.children_count > 0 || props.node.children?.length > 0) {
    emit('toggle', props.node.id)
  }
}
</script>

<template>
  <div>
    <!-- Nœud principal -->
    <div
      class="flex items-center gap-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      :style="{ paddingLeft }"
    >
      <!-- Bouton expand/collapse -->
      <button
        v-if="node.children_count > 0 || node.children?.length > 0"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 w-5"
        @click="handleToggle"
      >
        {{ isExpanded ? '−' : '+' }}
      </button>
      <div v-else class="w-5 flex-shrink-0"></div>

      <!-- Nom de l'entité ou groupe -->
      <div class="flex-1 min-w-0 flex items-center justify-between gap-2">
        <!-- Groupe (jamais cliquable, en gras) -->
        <span
          v-if="isGroup"
          class="font-semibold text-gray-900 dark:text-white truncate"
        >
          {{ node.name }}
        </span>

        <!-- Entité cliquable -->
        <NuxtLink
          v-else-if="isClickable"
          :to="`/etat-senegal/annuaire/${node.public_slug}`"
          class="text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
        >
          {{ node.name }}
        </NuxtLink>

        <!-- Entité non cliquable -->
        <span
          v-else
          class="text-gray-600 dark:text-gray-400 truncate"
        >
          {{ node.name }}
        </span>

        <!-- Compteur d'enfants -->
        <span
          v-if="node.children_count > 0"
          class="text-xs text-gray-400 flex-shrink-0"
        >
          ({{ node.children_count }})
        </span>
      </div>
    </div>

    <!-- Enfants (si expandé) -->
    <div v-if="isExpanded && node.children && node.children.length > 0">
      <StateTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :is-expanded="false"
        :level="level + 1"
        @toggle="emit('toggle', $event)"
      />
    </div>
  </div>
</template>
