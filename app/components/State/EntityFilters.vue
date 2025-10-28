<script setup lang="ts">
import type { StateEntityType, StateEntityStatus } from '~/types/state-entity'

interface Props {
  search?: string
  type?: StateEntityType
  status?: StateEntityStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:type': [value: StateEntityType | undefined]
  'update:status': [value: StateEntityStatus | undefined]
  reset: []
}>()

// Options pour les filtres
const typeOptions = [
  { value: undefined, label: 'Tous les types' },
  { value: 'ministere', label: 'Ministères' },
  { value: 'secretariat_etat', label: "Secrétariats d'État" },
  { value: 'direction', label: 'Directions' },
  { value: 'agence', label: 'Agences' },
  { value: 'autorite', label: 'Autorités' },
  { value: 'societe_nationale', label: 'Sociétés Nationales' },
  { value: 'etablissement', label: 'Établissements' },
  { value: 'commission', label: 'Commissions' },
  { value: 'conseil', label: 'Conseils' },
  { value: 'autre', label: 'Autres' },
]

const statusOptions = [
  { value: 'active', label: 'Actives' },
  { value: 'inactive', label: 'Inactives' },
  { value: 'dissolved', label: 'Dissoutes' },
  { value: 'merged', label: 'Fusionnées' },
  { value: 'renamed', label: 'Renommées' },
]

// Recherche locale avec debounce
const searchInput = ref(props.search || '')
const searchDebounced = refDebounced(searchInput, 500)

watch(searchDebounced, (value) => {
  emit('update:search', value)
})

// Type et status
const typeSelected = ref(props.type)
const statusSelected = ref(props.status || 'active')

watch(typeSelected, (value) => {
  emit('update:type', value)
})

watch(statusSelected, (value) => {
  emit('update:status', value as StateEntityStatus)
})

const handleReset = () => {
  searchInput.value = ''
  typeSelected.value = undefined
  statusSelected.value = 'active'
  emit('reset')
}
</script>

<template>
  <div class="space-y-4">
    <!-- Recherche -->
    <UInput
      v-model="searchInput"
      icon="i-heroicons-magnifying-glass"
      placeholder="Rechercher une entité (nom, acronyme)..."
      size="lg"
    />

    <!-- Filtres -->
    <div class="flex flex-wrap gap-3">
      <!-- Type -->
      <USelectMenu
        v-model="typeSelected"
        :options="typeOptions"
        placeholder="Type d'entité"
        size="md"
      >
        <template #label>
          <span v-if="typeSelected">
            {{ typeOptions.find((o) => o.value === typeSelected)?.label }}
          </span>
          <span v-else>Tous les types</span>
        </template>
      </USelectMenu>

      <!-- Status -->
      <USelectMenu v-model="statusSelected" :options="statusOptions" placeholder="Statut" size="md">
        <template #label>
          <span>{{ statusOptions.find((o) => o.value === statusSelected)?.label }}</span>
        </template>
      </USelectMenu>

      <!-- Reset -->
      <UButton color="gray" variant="outline" icon="i-heroicons-x-mark" @click="handleReset">
        Réinitialiser
      </UButton>
    </div>
  </div>
</template>
