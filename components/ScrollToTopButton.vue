<script setup lang="ts">
const showButton = ref(false);

const checkScroll = (): void => {
  showButton.value = window.scrollY > 300;
};

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", checkScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScroll);
});
</script>

<template>
  <UButton
    v-show="showButton"
    :ui="{ rounded: 'rounded-full' }"
    class="bg-primary fixed bottom-4 right-4 p-2 text-white shadow-lg"
    icon="i-heroicons-arrow-up-circle"
    @click="scrollToTop"
  >
    Sommaire
  </UButton>
</template>
