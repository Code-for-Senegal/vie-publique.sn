<template>
  <section
    v-if="!empty"
    :id="id"
    class="scroll-mt-16 border-t border-gray-100 pt-5 dark:border-gray-700 sm:scroll-mt-20 sm:pt-10"
    :aria-labelledby="`${id}-title`"
  >
    <h2
      :id="`${id}-title`"
      class="text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-xl"
    >
      {{ title }}
    </h2>
    <p v-if="description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      {{ description }}
    </p>
    <div class="mt-4 sm:mt-5">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
/**
 * Conteneur de section (page détail dossier) — style éditorial sobre :
 * titre + fine séparation, sans pastille colorée. Ancrage #id pour le sommaire.
 * Non rendu si `empty` (relation/bloc vide).
 */
interface Props {
  id: string;
  title: string;
  description?: string;
  /** Si vrai, la section n'est pas rendue. */
  empty?: boolean;
}

withDefaults(defineProps<Props>(), {
  empty: false,
});
</script>
