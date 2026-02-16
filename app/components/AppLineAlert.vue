<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="alertToShow"
        class="fixed bottom-16 left-0 right-0 z-[100] px-3 pb-2 sm:bottom-4 sm:px-4"
        role="alert"
        aria-live="polite"
      >
        <div
          class="mx-auto flex max-w-sm items-center gap-2.5 rounded-full px-4 py-2.5 shadow-lg backdrop-blur-sm sm:max-w-md sm:gap-3 sm:px-5 sm:py-3"
          :class="[
            isOnline
              ? 'bg-gray-900/95 text-white'
              : 'bg-red-500/95 text-white',
          ]"
        >
          <!-- Status indicator -->
          <span class="relative flex h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              :class="isOnline ? 'bg-emerald-400' : 'bg-white'"
            ></span>
            <span
              class="relative inline-flex h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
              :class="isOnline ? 'bg-emerald-400' : 'bg-white'"
            ></span>
          </span>

          <!-- Icon -->
          <div class="flex shrink-0 items-center justify-center">
            <UIcon
              :name="isOnline ? 'i-heroicons-wifi' : 'i-heroicons-signal-slash'"
              class="h-4 w-4 sm:h-5 sm:w-5"
            />
          </div>

          <!-- Message -->
          <span class="text-xs font-medium sm:text-sm">
            {{ alertMessage }}
          </span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useOnline } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    onlineMessage?: string;
    offlineMessage?: string;
  }>(),
  {
    onlineMessage: 'Connexion rétablie',
    offlineMessage: 'Aucune connexion Internet',
  },
);

const isOnline = useOnline();
const showOnline = ref(false);

const alertMessage = computed(() =>
  !isOnline.value ? props.offlineMessage : props.onlineMessage,
);

const alertToShow = computed(
  () => !isOnline.value || (isOnline.value && showOnline.value),
);

watch(isOnline, (newValue) => {
  if (newValue) {
    showOnline.value = true;
    setTimeout(() => {
      showOnline.value = false;
    }, 3000);
  }
});
</script>
