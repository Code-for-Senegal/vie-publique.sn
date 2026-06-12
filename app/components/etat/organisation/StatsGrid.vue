<script setup lang="ts">
const props = withDefaults(defineProps<{ clickable?: boolean }>(), { clickable: true })

const { entities } = useEtatOrganisation()

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
const TYPE_LINKS: Record<string, string> = {
  ministere: '/etat-senegal/ministeres',
  etablissement_public: '/etat-senegal/entites-publiques?type=etablissement_public',
  societe_nationale: '/etat-senegal/entites-publiques?type=societe_nationale',
  societe_participation_publique: '/etat-senegal/entites-publiques?type=societe_participation_publique',
}
const STAT_TYPES = ['ministere', 'etablissement_public', 'societe_nationale', 'societe_participation_publique']
const PLURAL_LABELS: Record<string, string> = {
  ministere: 'Ministères',
  etablissement_public: 'Établissements publics',
  societe_nationale: 'Sociétés nationales',
  societe_participation_publique: 'Sociétés à participation publique',
}

const typeStats = computed(() => {
  const counts = new Map<string, number>()
  for (const entity of entities.value) {
    if (STAT_TYPES.includes(entity.type_code)) {
      counts.set(entity.type_code, (counts.get(entity.type_code) || 0) + 1)
    }
  }
  return STAT_TYPES.filter(code => counts.has(code)).map(code => ({
    code,
    label: PLURAL_LABELS[code] || code,
    count: counts.get(code) || 0,
    icon: TYPE_ICONS[code] || 'i-heroicons-building-office',
    color: TYPE_COLORS[code] || 'bg-gray-100 text-gray-500',
    to: TYPE_LINKS[code],
  }))
})
</script>

<template>
  <div v-if="typeStats.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <NuxtLink
      v-for="stat in typeStats"
      :key="stat.code"
      :to="props.clickable ? stat.to : undefined"
      class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800/50"
      :class="props.clickable ? 'transition hover:border-gray-300 hover:shadow-sm dark:hover:border-gray-600' : 'pointer-events-none'"
    >
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" :class="stat.color">
        <UIcon :name="stat.icon" class="h-5 w-5" />
      </span>
      <div class="min-w-0">
        <p class="text-lg font-bold leading-none text-gray-900 dark:text-white">{{ stat.count }}</p>
        <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
      </div>
    </NuxtLink>
  </div>
</template>
