<script setup lang="ts">
interface MotionVoteProps {
    title: string;
    description: string;
}

defineProps<MotionVoteProps>();
</script>

<template>
    <div class="bg-white rounded-lg p-6 shadow-sm border">
        <div class="flex items-start gap-3">
            <div class="bg-blue-100 p-2 rounded-lg">
                📋
            </div>
            <div class="flex-1">
                <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
                <p class="mb-2">
                    {{ description }}
                </p>
            </div>
        </div>
    </div>
</template>