<template>
  <Transition name="component-fade" mode="out-in">
    <div
      v-if="alertToShow"
      class="offline-alert"
      :class="{
        'offline-alert--offline': !isOnline,
        'offline-alert--online': isOnline && showOnline,
      }"
    >
      <div class="offline-alert-content">
        <span
          class="offline-alert-indicator"
          :class="{
            'offline-alert-indicator--offline': !isOnline,
            'offline-alert-indicator--online': isOnline && showOnline,
          }"
        ></span>
        <span class="offline-alert-text">
          {{ alertMessage }}
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useOnline } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    onlineMessage?: string;
    offlineMessage?: string;
  }>(),
  {
    onlineMessage: "Connexion Internet restaurée avec succès !",
    offlineMessage: "Vous naviguez actuellement en mode hors connexion !",
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

<style scoped>
.offline-alert {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  padding: 10px;
  transition: all 0.3s ease;
}

.offline-alert-content {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #18181e;
  color: #dcdde0;
  padding: 12px 16px;
  border-radius: 7.5px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.offline-alert--offline {
  background-color: transparent;
}

.offline-alert--offline .offline-alert-content {
  background-color: #fd3552;
  color: white;
  animation: shake 0.5s;
}

.offline-alert-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 12px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.offline-alert-indicator--offline {
  background-color: white;
}

.offline-alert-indicator--online {
  background-color: #07e088;
}

.offline-alert-text {
  flex-grow: 1;
  font-weight: 500;
  text-align: center;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}

.component-fade-enter-from,
.component-fade-leave-to {
  opacity: 0;
}

@media screen and (min-width: 768px) {
  .offline-alert-content {
    max-width: 500px;
    border-radius: 5px;
  }
}
</style>
