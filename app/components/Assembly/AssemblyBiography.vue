<script setup lang="ts">
import type { Deputy } from "@/types/assembly/deputy";

interface ProfileHeaderProps {
  deputy: Deputy;
}

defineProps<ProfileHeaderProps>();
</script>

<template>
  <UCard v-if="deputy">
    <h2 class="mb-4 text-xl font-bold">
      Qui {{ deputy.gender === "F" ? "est-elle" : "est-il" }} ?
    </h2>
    <div class="space-y-4 text-gray-700">
      <p>
        {{ `${deputy.first_name} ${deputy.last_name.toUpperCase()}` }}
        {{ deputy.gender === "F" ? "est une députée" : "est un député" }} du
        groupe {{ deputy.group?.name }}.
      </p>

      <p>
        {{ deputy.gender === "F" ? "Élue" : "Élu" }} sur la liste
        {{ deputy.electoral_list?.name }}
      </p>

      <div
        v-if="deputy.bio"
        class="prose prose-gray max-w-none"
        v-html="deputy.bio"
      ></div>
    </div>
  </UCard>
</template>
