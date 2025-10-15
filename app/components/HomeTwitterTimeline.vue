<template>
  <div class="my-8">
    <div class="prose prose-sm sm:prose mx-auto mb-8">
      <h2 class="text-center text-gray-800 dark:text-white">
        Suivez notre actualité
      </h2>
    </div>

    <div class="mx-auto">
      <div class="custom-shadow rounded-xl bg-white p-4">
        <!-- Timeline X -->
        <a
          class="twitter-timeline"
          data-lang="fr"
          data-height="600"
          data-theme="light"
          data-chrome="noheader nofooter noborders transparent"
          data-tweet-limit="5"
          href="https://twitter.com/ViePubliqueSN"
        >
          Tweets by @ViePubliqueSN
        </a>

        <!-- Loading state -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <UIcon
            name="i-heroicons-arrow-path"
            class="h-8 w-8 animate-spin text-gray-400"
          />
        </div>

        <!-- Error state -->
        <div v-if="hasError" class="py-8 text-center">
          <p class="text-gray-600">Impossible de charger le fil d'actualité</p>
          <a
            href="https://x.com/ViePubliqueSN"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Voir sur X/Twitter
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="h-4 w-4"
            />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isLoading = ref(true);
const hasError = ref(false);
const loadTimeout = ref<number | null>(null);

const loadTwitterWidget = () => {
  try {
    // Timeout de sécurité après 10 secondes
    loadTimeout.value = window.setTimeout(() => {
      if (isLoading.value) {
        isLoading.value = false;
        hasError.value = true;
        console.error("Twitter widget loading timeout");
      }
    }, 10000);

    // Injection du script Twitter
    const script = document.createElement("script");
    script.setAttribute("src", "https://platform.twitter.com/widgets.js");
    script.setAttribute("async", "true");
    script.setAttribute("charset", "utf-8");

    script.onload = () => {
      // @ts-expect-error - Twitter widgets n'est pas typé
      if (window.twttr && window.twttr.widgets) {
        // @ts-expect-error - Twitter widgets n'est pas typé
        window.twttr.widgets
          .load()
          .then(() => {
            if (loadTimeout.value) {
              clearTimeout(loadTimeout.value);
            }
            isLoading.value = false;
            hasError.value = false;
          })
          .catch(() => {
            isLoading.value = false;
            hasError.value = true;
          });
      }
    };

    script.onerror = () => {
      console.error("Error loading Twitter script");
      isLoading.value = false;
      hasError.value = true;
    };

    document.head.appendChild(script);
  } catch (error) {
    console.error("Error loading Twitter widget:", error);
    isLoading.value = false;
    hasError.value = true;
  }
};

onMounted(() => {
  loadTwitterWidget();
});

onUnmounted(() => {
  if (loadTimeout.value) {
    clearTimeout(loadTimeout.value);
  }
});
</script>

<style scoped>
/* Style pour améliorer l'apparence du widget */
:deep(.twitter-timeline) {
  width: 100% !important;
}

:deep(.Timeline) {
  margin: 0 !important;
}

/* Styles pour mobile */
@media (max-width: 640px) {
  :deep(.timeline-Tweet-text) {
    font-size: 14px !important;
    line-height: 1.4 !important;
  }

  :deep(.timeline-Tweet-media) {
    margin-top: 0.5rem !important;
  }
}
</style>
