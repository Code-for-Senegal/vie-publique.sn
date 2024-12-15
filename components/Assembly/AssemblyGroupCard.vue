<template>
  <UCard class="rounded-none">
    <NuxtLink
      :to="`/assemblee-nationale/groupes/${group.id}/${$getSlugifyUrlPath(group.name)}`"
      class="group-card relative overflow-hidden rounded-lg bg-white shadow-sm"
    >
      <div class="flex flex-col items-center">
        <UAvatar
          v-if="group.logo"
          :src="$directusImageUrl(group.logo, '50')"
          :alt="`Logo ${group.name}`"
          size="2xl"
          loading="lazy"
          fetchpriority="high"
        />
        <UAvatar v-else icon="i-heroicons-photo" size="lg" />

        <!-- <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gray-100"
      >
        <UIcon name="i-heroicons-user-group" class="h-12 w-12 text-gray-400" />
      </div> -->

        <div class="text-center">
          <h3 class="text-lg font-semibold">{{ group.name }}</h3>
          <div class="mt-1 text-sm text-gray-500">
            {{ group.members?.length }} membres
          </div>
        </div>
      </div>
    </NuxtLink>
  </UCard>
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
