<script setup lang="ts">
const props = defineProps<{
  entity: any
  showParent?: boolean
}>()

// L'entité est cliquable si has_public_page = true
const isClickable = computed(() => props.entity.has_public_page === true)

// Lien vers la page de détail
const entityLink = computed(() =>
  isClickable.value ? `/etat-senegal/annuaire/${props.entity.public_slug}` : null
)
</script>

<template>
  <div
    class="border-b border-gray-200 dark:border-gray-700 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors px-2"
    :class="{ 'cursor-pointer': isClickable }"
  >
    <div class="flex items-center justify-between gap-4">
      <!-- Contenu principal -->
      <div class="flex-1 min-w-0">
        <!-- Nom de l'entité -->
        <NuxtLink
          v-if="isClickable"
          :to="entityLink!"
          class="text-base font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {{ entity.name }}
        </NuxtLink>
        <span
          v-else
          class="text-base font-medium text-gray-500 dark:text-gray-400"
        >
          {{ entity.name }}
        </span>

        <!-- Parent (si non-ministère et showParent = true) -->
        <div
          v-if="showParent && entity.parent_entity"
          class="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          Rattaché à : <span class="font-medium">{{ entity.parent_entity.name }}</span>
        </div>
      </div>

      <!-- Flèche de navigation (si cliquable) -->
      <div v-if="isClickable" class="flex-shrink-0 text-gray-400 text-xl">
        →
      </div>
    </div>
  </div>
</template>
