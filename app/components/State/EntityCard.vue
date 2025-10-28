<script setup lang="ts">
import type { StateEntity } from '~/types/state-entity';

interface Props {
  entity: StateEntity;
  showParent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showParent: false,
});

// Affichage du nom (avec acronyme si disponible)
const displayName = computed(() => {
  if (props.entity.acronym) {
    return `${props.entity.name} (${props.entity.acronym})`;
  }
  return props.entity.name;
});

// Parent entity
const parentEntity = computed(() => {
  if (typeof props.entity.parent_entity === 'object' && props.entity.parent_entity !== null) {
    return props.entity.parent_entity;
  }
  return null;
});
</script>

<template>
  <UCard :ui="{ body: { padding: 'p-4 sm:p-6' } }">
    <NuxtLink
      :to="`/etat-senegal/annuaire/${entity.public_slug}`"
      class="block rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <!-- Type et Statut -->
      <div class="mb-3 flex items-center gap-2">
        <StateEntityTypeBadge :type="entity.type" />
        <StateEntityStatusBadge :status="entity.status" />
      </div>

      <!-- Nom -->
      <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {{ displayName }}
      </h3>

      <!-- Short name -->
      <p
        v-if="entity.short_name && entity.short_name !== entity.name"
        class="mb-2 text-sm text-gray-600 dark:text-gray-400"
      >
        {{ entity.short_name }}
      </p>

      <!-- Description -->
      <p
        v-if="entity.description"
        class="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
      >
        {{ entity.description }}
      </p>

      <!-- Parent -->
      <div
        v-if="showParent && parentEntity"
        class="mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <UIcon name="i-heroicons-building-office-2" class="h-4 w-4" />
        <span class="truncate">{{ parentEntity.name }}</span>
      </div>

      <!-- Responsable -->
      <div
        v-if="entity.director_name"
        class="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <UIcon name="i-heroicons-user" class="h-4 w-4" />
        <span>
          {{ entity.director_title || 'Responsable' }}: <strong>{{ entity.director_name }}</strong>
        </span>
      </div>

      <!-- Contact -->
      <div class="mt-3 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
        <div v-if="entity.website" class="flex items-center gap-1">
          <UIcon name="i-heroicons-globe-alt" class="h-4 w-4" />
          <span class="truncate">{{ entity.website }}</span>
        </div>
        <div v-if="entity.phone" class="flex items-center gap-1">
          <UIcon name="i-heroicons-phone" class="h-4 w-4" />
          <span>{{ entity.phone }}</span>
        </div>
        <div v-if="entity.email" class="flex items-center gap-1">
          <UIcon name="i-heroicons-envelope" class="h-4 w-4" />
          <span class="truncate">{{ entity.email }}</span>
        </div>
      </div>
    </NuxtLink>
  </UCard>
</template>
