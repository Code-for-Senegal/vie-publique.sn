<script setup lang="ts">
import type { EtatOrganisationTreeNode } from '~~/types/etat-organisation'

const props = withDefaults(
  defineProps<{
    node: EtatOrganisationTreeNode
    depth?: number
  }>(),
  { depth: 0 },
)

const isOpen = ref(false)
const hasChildren = computed(() => props.node.children.length > 0)
const isRoot = computed(() => props.depth === 0)

// Listen to expand-all / collapse-all from parent tree
const treeExpandAll = inject<Ref<boolean>>('treeExpandAll', ref(false))
const treeCollapseAll = inject<Ref<boolean>>('treeCollapseAll', ref(false))

watch(treeExpandAll, (v) => { if (v && hasChildren.value) isOpen.value = true })
watch(treeCollapseAll, (v) => { if (v) isOpen.value = false })

const TYPE_ICONS: Record<string, string> = {
  presidence: 'i-heroicons-building-library',
  primature: 'i-heroicons-building-office-2',
  ministere: 'i-heroicons-building-office',
  cabinet: 'i-heroicons-users',
  secretariat: 'i-heroicons-document-text',
  direction: 'i-heroicons-map-pin',
  service: 'i-heroicons-squares-2x2',
  etablissement_public: 'i-heroicons-academic-cap',
  societe_nationale: 'i-heroicons-building-storefront',
  societe_participation_publique: 'i-heroicons-building-storefront',
  agence: 'i-heroicons-megaphone',
  autres_administrations: 'i-heroicons-ellipsis-horizontal-circle',
  entite_regroupement: 'i-heroicons-folder-open',
  autres: 'i-heroicons-ellipsis-horizontal-circle',
}

const TYPE_BG_COLORS: Record<string, string> = {
  presidence: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  primature: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  ministere: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cabinet: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  direction: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  service: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  etablissement_public: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  societe_nationale: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  agence: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  entite_regroupement: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
}

const typeIcon = computed(() => TYPE_ICONS[props.node.type_code] || 'i-heroicons-building-office')
const typeBgColor = computed(() => TYPE_BG_COLORS[props.node.type_code] || 'bg-gray-100 text-gray-500')

const indentPx = computed(() => Math.min((props.depth - 1) * 24 + (props.depth > 0 ? 12 : 0), 96))
</script>

<template>
  <div>
    <!-- ROOT NODE (depth=0): full-width card row -->
    <div
      v-if="isRoot"
      class="group cursor-pointer select-none"
      @click="hasChildren && (isOpen = !isOpen)"
    >
      <div
        class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
        :class="isOpen ? 'bg-gray-50 dark:bg-gray-800/30' : ''"
      >
        <!-- Colored icon -->
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" :class="typeBgColor">
          <UIcon :name="typeIcon" class="h-5 w-5" />
        </span>

        <!-- Name + type label -->
        <div class="min-w-0 flex-1">
          <NuxtLink
            v-if="node.has_public_page"
            :to="`/etat-senegal/${node.public_slug}`"
            class="block text-sm font-bold text-gray-900 hover:text-emerald-700 dark:text-white dark:hover:text-emerald-400"
            @click.stop
          >
            {{ node.name }}
          </NuxtLink>
          <p v-else class="text-sm font-bold text-gray-900 dark:text-white">{{ node.name }}</p>
          <p class="mt-0.5 text-xs text-gray-500">{{ node.type_label }}</p>
        </div>

        <!-- Children count + toggle -->
        <div v-if="hasChildren" class="flex items-center gap-2">
          <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {{ node.children.length }}
          </span>
          <UIcon
            :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
            class="h-4 w-4 text-gray-400 transition-transform duration-150"
          />
        </div>
      </div>
    </div>

    <!-- CHILD NODES (depth > 0): indented row with tree guide -->
    <div
      v-else
      class="group relative flex items-center gap-2 py-2 pr-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/40"
      :class="hasChildren ? 'cursor-pointer select-none' : ''"
      :style="{ paddingLeft: `${indentPx + 12}px` }"
      @click="hasChildren && (isOpen = !isOpen)"
    >
      <!-- Vertical guide line from parent -->
      <span
        class="pointer-events-none absolute bottom-0 top-0 w-px bg-gray-100 dark:bg-gray-800"
        :style="{ left: `${indentPx - 4}px` }"
      />

      <!-- Toggle or leaf indicator -->
      <button
        v-if="hasChildren"
        class="relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700"
        @click="isOpen = !isOpen"
      >
        <UIcon
          :name="isOpen ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
          class="h-3.5 w-3.5"
        />
      </button>
      <span v-else class="relative z-10 h-5 w-5 shrink-0" />

      <!-- Colored icon (smaller) -->
      <span
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded"
        :class="typeBgColor"
      >
        <UIcon :name="typeIcon" class="h-3.5 w-3.5" />
      </span>

      <!-- Name -->
      <NuxtLink
        v-if="node.has_public_page"
        :to="`/etat-senegal/${node.public_slug}`"
        class="min-w-0 flex-1 text-sm text-gray-800 hover:text-emerald-700 dark:text-gray-200 dark:hover:text-emerald-400"
        :class="depth === 1 ? 'font-medium' : ''"
        @click.stop
      >
        {{ node.name }}
      </NuxtLink>
      <span
        v-else
        class="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-gray-400"
        :class="depth === 1 ? 'font-medium text-gray-800 dark:text-gray-200' : ''"
      >
        {{ node.name }}
      </span>

      <!-- Type badge (sm+) -->
      <UBadge color="gray" variant="subtle" size="xs" class="hidden shrink-0 sm:inline-flex">
        {{ node.type_label }}
      </UBadge>

      <!-- Children count -->
      <span v-if="hasChildren" class="shrink-0 text-xs text-gray-400">
        {{ node.children.length }}
      </span>
    </div>

    <!-- Children (recursive) -->
    <div v-if="isOpen && hasChildren" :class="isRoot ? '' : ''">
      <EtatOrganisationTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </div>
  </div>
</template>
