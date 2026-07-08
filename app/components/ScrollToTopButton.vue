<script setup lang="ts">
const showButton = ref(false);

const checkScroll = (): void => {
  showButton.value = window.scrollY > 300;
};

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", checkScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScroll);
});
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-90"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-90"
  >
    <button
      v-show="showButton"
      class="fixed z-40 flex items-center justify-center rounded-full bg-gray-900 text-white shadow-lg active:scale-95 dark:bg-white dark:text-gray-900 bottom-20 right-3 h-10 w-10 lg:bottom-6 lg:right-6 lg:h-10 lg:w-auto lg:gap-2 lg:px-4 lg:pr-5"
      aria-label="Retour en haut"
      @click="scrollToTop"
    >
      <UIcon name="i-heroicons-arrow-up" class="h-5 w-5 shrink-0" />
      <span class="hidden lg:inline text-sm font-medium">Haut</span>
    </button>
  </Transition>
</template>
