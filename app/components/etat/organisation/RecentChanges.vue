<script setup lang="ts">
import type { EtatOrganisationOverview } from '~~/types/etat-organisation'

const props = defineProps<{
  overview: EtatOrganisationOverview | null
}>()

const CATEGORY_META: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  created: {
    label: 'Créations',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: 'i-heroicons-plus-circle',
  },
  deleted: {
    label: 'Suppressions',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: 'i-heroicons-minus-circle',
  },
  rename: {
    label: 'Renommages',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    icon: 'i-heroicons-pencil',
  },
  reparent: {
    label: 'Changements de tutelle',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    icon: 'i-heroicons-arrows-right-left',
  },
  merge: {
    label: 'Fusions',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    icon: 'i-heroicons-funnel',
  },
  split: {
    label: 'Scissions',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    icon: 'i-heroicons-scissors',
  },
}

const getCategoryMeta = (category: string) =>
  CATEGORY_META[category] ?? {
    label: category,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
    icon: 'i-heroicons-information-circle',
  }

const changeSummary = computed(() => props.overview?.changes?.summary ?? [])
const recentChanges = computed(() => props.overview?.recent_changes ?? [])
const fromDecree = computed(() => props.overview?.decree?.previous_numero)
const toDecree = computed(() => props.overview?.decree?.numero)
const totalChanges = computed(() => props.overview?.changes?.total ?? changeSummary.value.reduce((acc, s) => acc + s.count, 0))
const linkComponent = resolveComponent('NuxtLink')
</script>

<template>
  <div v-if="recentChanges.length > 0 || changeSummary.length > 0" class="space-y-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">
          Derniers changements
        </h2>
        <p v-if="fromDecree && toDecree" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          Entre le décret <span class="font-medium text-gray-700 dark:text-gray-300">n°&nbsp;{{ fromDecree }}</span>
          et le décret <span class="font-medium text-gray-700 dark:text-gray-300">n°&nbsp;{{ toDecree }}</span>
          <span v-if="totalChanges" class="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {{ totalChanges }} modifications
          </span>
        </p>
      </div>
      <NuxtLink
        to="/etat-senegal/organisation/changements"
        class="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40"
      >
        <UIcon name="i-heroicons-arrow-right" class="h-3.5 w-3.5" />
        Voir tous les changements
      </NuxtLink>
    </div>

    <!-- Summary chips -->
    <div v-if="changeSummary.length" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="stat in changeSummary"
        :key="stat.category"
        :to="`/etat-senegal/organisation/changements?category=${stat.category}`"
        class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition hover:opacity-80"
        :class="[getCategoryMeta(stat.category).bg, getCategoryMeta(stat.category).color, 'border-transparent']"
      >
        <UIcon :name="getCategoryMeta(stat.category).icon" class="h-3.5 w-3.5" />
        {{ stat.count }} {{ getCategoryMeta(stat.category).label.toLowerCase() }}
      </NuxtLink>
    </div>

    <!-- Recent change list (top ~8) -->
    <ul class="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white dark:divide-gray-700/50 dark:border-gray-700 dark:bg-gray-800/50">
      <li
        v-for="change in recentChanges.slice(0, 8)"
        :key="change.id"
        class="flex items-center gap-3 px-4 py-3"
      >
        <!-- Category icon -->
        <span
          class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          :class="getCategoryMeta(change.category).bg"
        >
          <UIcon
            :name="getCategoryMeta(change.category).icon"
            class="h-3.5 w-3.5"
            :class="getCategoryMeta(change.category).color"
          />
        </span>

        <!-- Text (entire block clickable when entity has a public page) -->
        <component
          :is="change.has_public_page && change.slug ? linkComponent : 'div'"
          :to="change.has_public_page && change.slug ? `/etat-senegal/${change.slug}` : undefined"
          class="group min-w-0 flex-1"
          :class="{ 'cursor-pointer': change.has_public_page && change.slug }"
        >
          <p
            class="text-sm font-medium text-gray-800 dark:text-gray-200"
            :class="{ 'group-hover:text-blue-600 dark:group-hover:text-blue-400': change.has_public_page && change.slug }"
          >
            {{ change.name || change.description }}
          </p>
          <!-- Parent breadcrumb -->
          <p
            v-if="change.root_name"
            class="mt-0.5 text-xs text-gray-400 dark:text-gray-500"
          >
            {{ change.root_name }}
          </p>
          <div class="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span :class="getCategoryMeta(change.category).color">{{ getCategoryMeta(change.category).label }}</span>
          </div>
        </component>

        <!-- Decree range — right side, hidden on mobile -->
        <span
          v-if="change.from_decree"
          class="hidden shrink-0 text-xs text-gray-400 dark:text-gray-500 sm:block"
        >
          {{ change.from_decree }} → {{ change.to_decree }}
        </span>

        <!-- Chevron arrow for entities with a public page -->
        <UIcon
          v-if="change.has_public_page && change.slug"
          name="i-heroicons-chevron-right"
          class="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600"
        />
      </li>
    </ul>

  </div>
</template>
