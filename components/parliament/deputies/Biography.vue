<script setup lang="ts">
import type { Deputy } from '@/types/deputy';

interface ProfileHeaderProps {
    deputy: Deputy;
}

defineProps<ProfileHeaderProps>();

</script>

<template>
  <div v-if="deputy" class="bg-white rounded-lg p-6 shadow-sm border">
    <h2 class="text-2xl font-semibold mb-6">
      Qui {{ deputy.gender === 'F' ? 'est-elle' : 'est-il' }} ?
    </h2>
    <div class="space-y-4 text-gray-700">
      <p>{{ `${deputy.first_name} ${deputy.last_name.toUpperCase()}` }}, {{ deputy.gender === 'F' ? 'est la députée' : 'est le député' }} de {{ deputy.electoral_list?.coalition.name }}.</p>
      <p>
        {{ deputy.biography }}
      </p>
    </div>
  </div>
</template>