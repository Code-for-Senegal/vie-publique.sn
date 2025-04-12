<template>
  <div class="space-y-2">
    <NuxtLink
      v-for="question in questions?.slice(0, 3)"
      :key="question.id"
      :to="`/assemblee-nationale/questions/${question.id}`"
      class="block rounded-lg bg-gray-50 p-2 transition hover:bg-gray-100"
    >
      <div class="flex items-center gap-3">
        <!-- Ajout de l'image du député -->
        <img
          :src="$directusImageUrl(question.deputy.photo, '50')"
          :alt="question.deputy.first_name + ' ' + question.deputy.last_name"
          class="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <div class="line-clamp-2 text-xs text-gray-500">
            {{ question.deputy.first_name }}
            {{ question.deputy.last_name }}
          </div>
          <div class="line-clamp-2 text-xs font-medium">
            {{ question.subject }}
          </div>
          <time class="text-xs text-gray-500">
            {{ $dateformat(question.question_date) }}
          </time>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  questions: any;
}>();
</script>
