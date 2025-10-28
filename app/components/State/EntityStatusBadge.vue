<script setup lang="ts">
import type { StateEntityStatus } from '~/types/state-entity'

interface Props {
  status: StateEntityStatus
}

const props = defineProps<Props>()

// Configuration des statuts
const statusConfig: Record<StateEntityStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'green' },
  inactive: { label: 'Inactive', color: 'gray' },
  dissolved: { label: 'Dissoute', color: 'red' },
  merged: { label: 'Fusionnée', color: 'orange' },
  renamed: { label: 'Renommée', color: 'blue' },
}

const config = computed(() => statusConfig[props.status] || statusConfig.inactive)
</script>

<template>
  <UBadge :color="config.color" variant="subtle" size="xs">
    {{ config.label }}
  </UBadge>
</template>
