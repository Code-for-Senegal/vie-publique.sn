<template>
  <div class="space-y-2">
    <NuxtLink
      v-for="vote in votes?.slice(0, 3)"
      :key="vote.id"
      :to="`/assemblee-nationale/votes/${vote.id}`"
      class="block rounded-lg bg-gray-50 p-2 transition hover:bg-gray-100"
    >
      <!-- <time class="mt-2 block text-xs text-gray-500">
                {{ $dateformat(vote.date) }}
              </time> -->
      <!-- Header: Date et Status -->
      <div class="mb-2 flex items-center justify-between">
        <span class="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-600">
          {{ $getAssemblyVoteLabel(vote.type) }}
        </span>

        <UBadge
          :color="vote.status === 'adopted' ? 'emerald' : 'red'"
          class="font-medium uppercase"
          size="xs"
        >
          {{ vote.status === "adopted" ? "Adopté" : "Rejeté" }}
        </UBadge>
      </div>
      <h3 class="line-clamp-2 text-sm font-medium" v-text="vote.name"></h3>
      <!-- Tag catégorie -->
      <div>
        <time class="mt-1 block text-xs text-gray-500">
          {{ $dateformat(vote.date) }}
        </time>
      </div>
    </NuxtLink>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  votes: any;
}>();
</script>
