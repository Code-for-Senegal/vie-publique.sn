<script setup lang="ts">
import type { Vote } from '@/types/vote';

interface RecentVotesProps {
  votes: Vote[];
}

// Un computed label vote pour afficher le vote en toute lettre
const labelVote = (vote: number | null) => {
  if (vote === 0) return 'Contre';
  if (vote === 1) return 'Pour';
  return 'Non voté';
};

defineProps<RecentVotesProps>();

</script>

<template>
    <div class="bg-white rounded-lg p-6 shadow-sm border">
        <h2 class="text-2xl font-semibold mb-4">Ses derniers votes</h2>
        <div class="space-y-4">
            <div v-for="(vote, index) in votes" :key="index" class="flex gap-4 items-center">
                <div :class="{
                    'text-red-600 font-semibold': vote.vote === 0,
                    'text-green-600 font-semibold': vote.vote === 1,
                    'text-gray-600': vote.vote === null
                }">
                    {{ labelVote(vote.vote) }}
                </div>
                <div class="flex-1">
                    <p> {{ vote.motion.title }} </p>
                    <p class="text-sm text-gray-500">{{ vote.motion.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>