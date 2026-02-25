<script setup lang="ts">
/**
 * Section partenaires — mobile-first horizontal scroll, grille desktop
 */
const { partners, loading, error, refresh } = usePartners();

const scrollEl = ref<HTMLElement | null>(null);
const showLeftFade = ref(false);
const showRightFade = ref(true);

function onScroll() {
  const el = scrollEl.value;
  if (!el) return;
  showLeftFade.value = el.scrollLeft > 8;
  showRightFade.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 8;
}
</script>

<template>
  <section class="py-2">
    <!-- Header -->
    <div class="mb-4 gap-2">
    <h2
      id="news-heading"
      class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white"
    >
        Nos Partenaires
      </h2>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="hide-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:gap-4 md:mx-0 md:flex-wrap md:justify-center md:overflow-x-visible md:px-0 md:pb-0"
    >
      <div
        v-for="n in 4"
        :key="n"
        class="flex-shrink-0"
      >
        <div
          class="flex h-16 w-28 items-center justify-center rounded-xl bg-white ring-1 ring-gray-100 sm:h-20 sm:w-36 dark:bg-gray-800/80 dark:ring-gray-800"
        >
          <USkeleton class="h-8 w-16 rounded sm:h-10 sm:w-20" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <UCard
      v-else-if="error"
      class="mx-auto max-w-xs text-center"
      :ui="{ body: { padding: 'p-4 sm:p-5' } }"
    >
      <div
        class="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20"
      >
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="h-4 w-4 text-red-500 dark:text-red-400"
        />
      </div>
      <p class="mb-2.5 text-xs text-gray-500 dark:text-gray-400">
        Impossible de charger les partenaires
      </p>
      <UButton
        size="2xs"
        color="red"
        variant="soft"
        label="Réessayer"
        icon="i-heroicons-arrow-path-20-solid"
        @click="refresh()"
      />
    </UCard>

    <!-- Partners list -->
    <div v-else-if="partners.length > 0" class="relative">
      <!-- Left fade -->
      <div
        class="scroll-fade scroll-fade--left pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-10 md:hidden"
        :class="showLeftFade ? 'is-visible' : ''"
        aria-hidden="true"
      />
      <!-- Right fade -->
      <div
        class="scroll-fade scroll-fade--right pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-10 md:hidden"
        :class="showRightFade ? 'is-visible' : ''"
        aria-hidden="true"
      />

      <div
        ref="scrollEl"
        class="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:gap-4 md:mx-0 md:flex-wrap md:justify-center md:gap-5 md:overflow-x-visible md:px-0 md:pb-0"
        @scroll.passive="onScroll"
      >
        <a
          v-for="partner in partners"
          :key="partner.id"
          :href="partner.website || '#'"
          :target="partner.website ? '_blank' : undefined"
          rel="noopener noreferrer"
          class="group flex-shrink-0 snap-start"
        >
          <div
            class="flex h-16 w-28 items-center justify-center rounded-xl bg-white p-2.5 ring-1 ring-gray-100 transition-all duration-200 active:scale-95 sm:h-20 sm:w-36 sm:p-3 sm:hover:ring-gray-200 sm:hover:shadow-sm dark:bg-gray-800/80 dark:ring-gray-800 dark:sm:hover:ring-gray-700"
          >
            <img
              :src="useCmsImage(partner.logo, '80')"
              :alt="partner.name"
              class="max-h-full max-w-full object-contain opacity-60 grayscale transition-all duration-300 sm:group-hover:opacity-100 sm:group-hover:grayscale-0"
              loading="lazy"
            />
          </div>
        </a>
      </div>
    </div>

    <!-- Empty -->
    <p
      v-else
      class="py-4 text-center text-xs text-gray-400 dark:text-gray-500"
    >
      Aucun partenaire disponible
    </p>
  </section>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Scroll fade edges */
.scroll-fade {
  --fade-color: 255, 255, 255;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.scroll-fade.is-visible {
  opacity: 1;
}
.scroll-fade--right {
  background: linear-gradient(
    to left,
    rgba(var(--fade-color), 1) 0%,
    rgba(var(--fade-color), 0.74) 18%,
    rgba(var(--fade-color), 0.44) 42%,
    rgba(var(--fade-color), 0.16) 68%,
    rgba(var(--fade-color), 0) 100%
  );
}
.scroll-fade--left {
  background: linear-gradient(
    to right,
    rgba(var(--fade-color), 1) 0%,
    rgba(var(--fade-color), 0.74) 18%,
    rgba(var(--fade-color), 0.44) 42%,
    rgba(var(--fade-color), 0.16) 68%,
    rgba(var(--fade-color), 0) 100%
  );
}
:root.dark .scroll-fade {
  --fade-color: 17, 24, 39;
}
</style>
