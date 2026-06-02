<script setup lang="ts">
const { primeMinister, ministers, loading, error } = useGovernment();

// Afficher les 8 premiers ministres
const previewMinisters = computed(() => ministers.value.slice(0, 8));

const getPortraitUrl = (member: { id?: string; slug?: string }) => {
  const slug = member.slug || member.id;
  return `/personnalites/${member.id}/${slug}?ref=gouvernement`;
};
</script>

<template>
  <section class="my-4" aria-labelledby="government-heading">
    <h2
      id="government-heading"
      class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white"
    >
      Gouvernement du Sénégal
    </h2>

    <UCard
      class="overflow-hidden border-0 bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800/50"
      :ui="{ body: { padding: 'p-4 sm:p-6' } }"
    >

      <!-- Loading -->
      <div v-if="loading" class="space-y-3">
        <USkeleton class="h-16 w-full rounded-xl" />
        <div class="flex gap-2 overflow-hidden">
          <USkeleton v-for="n in 4" :key="n" class="h-28 w-20 shrink-0 rounded-lg" />
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="py-6 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        Impossible de charger le gouvernement
      </div>

      <!-- Content -->
      <div v-else>
        <!-- PM highlight -->
        <NuxtLink
          v-if="primeMinister"
          :to="getPortraitUrl(primeMinister)"
          class="group mb-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-3 ring-1 ring-amber-100 transition-all hover:shadow-sm dark:from-amber-950/30 dark:to-orange-950/20 dark:ring-amber-900/50"
        >
          <img
            :src="primeMinister.photo ? useCmsImage(primeMinister.photo) : '/unknown_member.webp'"
            :alt="primeMinister.name"
            class="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-amber-200 dark:ring-amber-800"
          />
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-medium uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Premier Ministre
            </p>
            <p class="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {{ primeMinister.name }}
            </p>
            <p class="truncate text-xs text-gray-500 dark:text-gray-400">
              {{ primeMinister.role }}
            </p>
          </div>
          <UIcon
            name="i-heroicons-chevron-right-20-solid"
            class="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 dark:text-gray-600"
          />
        </NuxtLink>

        <!-- Ministers preview -->
        <div
          v-if="previewMinisters.length > 0"
          class="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 pt-0.5"
        >
          <NuxtLink
            v-for="minister in previewMinisters"
            :key="minister.id"
            :to="getPortraitUrl(minister)"
            class="group relative w-20 shrink-0 snap-start sm:w-24"
          >
            <div class="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
              <img
                :src="minister.photo ? useCmsImage(minister.photo) : '/unknown_member.webp'"
                :alt="minister.name"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div class="absolute inset-x-0 bottom-0 p-1.5">
                <p class="line-clamp-2 text-[10px] font-medium leading-tight text-white">
                  {{ minister.name }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- CTA -->
        <div class="mt-4 text-center">
          <UButton
            to="/gouvernement-senegal"
            color="gray"
            variant="solid"
            size="md"
            trailing-icon="i-heroicons-arrow-right"
            class="rounded-full border-gray-200 bg-white font-medium"
          >
            Voir la composition du gouvernement
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
