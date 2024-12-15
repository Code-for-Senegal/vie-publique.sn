<script setup lang="ts">
import type { Deputy } from "@/types/assembly/deputy";

interface ProfileHeaderProps {
  deputy: Deputy;
}

defineProps<ProfileHeaderProps>();
</script>

<template>
  <div v-if="deputy" class="rounded-lg border bg-white p-6 shadow-sm">
    <h2 class="mb-6 text-2xl font-semibold">
      Qui {{ deputy.gender === "F" ? "est-elle" : "est-il" }} ?
    </h2>
    <div class="space-y-4 text-gray-700">
      <p>
        {{ `${deputy.first_name} ${deputy.last_name.toUpperCase()}` }},
        {{ deputy.gender === "F" ? "est la députée" : "est le député" }} de
        {{ deputy.electoral_list?.coalition.name }}.
      </p>

      <p>Élection sur la liste {{ deputy.electoral_list?.name }}</p>

      <p>
        {{ deputy.biography }}
      </p>
    </div>
  </div>
</template>
