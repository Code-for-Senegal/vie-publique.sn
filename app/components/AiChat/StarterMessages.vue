<template>
  <TransitionGroup
    name="message"
    tag="ul"
    class="space-y-1 divide-y divide-neutral-100 dark:divide-white/10"
  >
    <li
      v-for="(message, index) in staticStarters"
      :key="index"
      :style="{ animationDelay: `${index * 100}ms` }"
      class="animate-in"
    >
      <UButton
        :label="message"
        class="my-1 w-full py-3 font-normal"
        color="neutral"
        variant="ghost"
        @click="handleSelect(message)"
      />
    </li>
  </TransitionGroup>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "on-select", message: string): void;
}>();

const handleSelect = (message: string) => {
  emit("on-select", message);
};

const staticStarters = [
  "Comment utiliser Nuxt.js pour un site statique ?",
  "Quels sont les avantages de Vue.js ?",
  "Expliquez le SEO avec Nuxt.js",
  "Comment créer un composant réutilisable ?",
];
</script>

<style scoped>
.animate-in {
  animation: fadeSlideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(10px);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
