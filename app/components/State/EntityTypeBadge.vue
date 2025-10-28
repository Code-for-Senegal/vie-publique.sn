<script setup lang="ts">
import type { StateEntityType } from '~/types/state-entity'

interface Props {
  type: StateEntityType
}

const props = defineProps<Props>()

// Configuration des types avec couleurs et labels
const typeConfig: Record<StateEntityType, { label: string; color: string }> = {
  ministere: { label: 'Ministère', color: 'primary' },
  secretariat_etat: { label: "Secrétariat d'État", color: 'blue' },
  direction: { label: 'Direction', color: 'green' },
  agence: { label: 'Agence', color: 'purple' },
  autorite: { label: 'Autorité', color: 'orange' },
  societe_nationale: { label: 'Société Nationale', color: 'red' },
  etablissement: { label: 'Établissement', color: 'indigo' },
  commission: { label: 'Commission', color: 'pink' },
  conseil: { label: 'Conseil', color: 'teal' },
  autre: { label: 'Autre', color: 'gray' },
}

const config = computed(() => typeConfig[props.type] || typeConfig.autre)
</script>

<template>
  <UBadge :color="config.color" variant="subtle" size="xs">
    {{ config.label }}
  </UBadge>
</template>
