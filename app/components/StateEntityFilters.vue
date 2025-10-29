<script setup lang="ts">
import type { StateEntityType } from '~/types/state-entity'

const props = defineProps<{
  search: string
  type?: StateEntityType
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:type': [value: StateEntityType | undefined]
}>()

// Filtres par type simples
const typeFilters = [
  { code: 'ministry', label: 'Ministères' },
  { code: 'agency', label: 'Agences' },
  { code: 'public_institution', label: 'Établissements Publics' },
  { code: 'state_owned_enterprise', label: 'Sociétés Nationales' },
]

const searchValue = ref(props.search)

// Debounce pour la recherche
const debouncedSearch = useDebounceFn((value: string) => {
  emit('update:search', value)
}, 300)

watch(() => props.search, (newValue) => {
  searchValue.value = newValue
})

watch(searchValue, (value) => {
  debouncedSearch(value)
})

const selectType = (typeCode: StateEntityType | undefined) => {
  console.log('StateEntityFilters - selectType called with:', typeCode, typeof typeCode)
  emit('update:type', typeCode)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Barre de recherche -->
    <UInput
      v-model="searchValue"
      icon="i-heroicons-magnifying-glass"
      size="lg"
      placeholder="Rechercher une entité par nom ou sigle..."
      :ui="{ icon: { trailing: { pointer: '' } } }"
    >
      <template v-if="searchValue" #trailing>
        <UButton
          color="gray"
          variant="link"
          icon="i-heroicons-x-mark-20-solid"
          :padded="false"
          @click="searchValue = ''"
        />
      </template>
    </UInput>

    <!-- Pills de filtres par type (simple, sans icônes) -->
    <div class="flex flex-wrap gap-2">
      <!-- Bouton "Tous" -->
      <UButton
        :variant="!type ? 'solid' : 'outline'"
        color="gray"
        size="sm"
        @click="selectType(undefined)"
      >
        Tous
      </UButton>

      <!-- Boutons par type -->
      <UButton
        v-for="filter in typeFilters"
        :key="filter.code"
        :variant="type === filter.code ? 'solid' : 'outline'"
        :color="type === filter.code ? 'primary' : 'gray'"
        size="sm"
        @click="selectType(filter.code)"
      >
        {{ filter.label }}
      </UButton>
    </div>
  </div>
</template>
