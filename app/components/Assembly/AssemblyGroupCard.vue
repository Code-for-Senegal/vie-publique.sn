<template>
  <NuxtLink
    :to="`/assemblee-nationale/groupes/${group.id}/${$getSlugifyUrlPath(group.name)}`"
    class="group-card block rounded-2xl bg-white p-4 ring-1 ring-gray-100 transition-all dark:bg-gray-800 dark:ring-gray-700"
  >
    <div class="flex flex-col items-center">
      <UAvatar
        v-if="group.logo"
        :src="useCmsImage(group.logo, '50')"
        :alt="`Logo ${group.name}`"
        size="2xl"
        fetchpriority="high"
      />
      <UAvatar v-else icon="i-heroicons-photo" size="lg" />

      <div class="text-center">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ group.name }}</h3>
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ group.members?.length }} membres
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface GroupProps {
  id: number;
  name: string;
  logo: string | null;
  members: number[];
  president: {
    photo: string;
    first_name: string;
    last_name: string;
  } | null;
}

defineProps<{
  group: GroupProps;
}>();
</script>

<style scoped>
.group-card {
  @apply transition-all duration-200;
}
.group-card:hover {
  @apply -translate-y-1 transform shadow-md;
}
</style>
