<script setup lang="ts">
/**
 * Page Guide Électoral - Sénégal
 */

const route = useRoute();
const router = useRouter();

const selectedType = ref<string>((route.query.type as string) || 'all');

const electionTypes = [
    { label: 'Toutes les élections', value: 'all' },
    { label: 'Présidentielles', value: 'presidential' },
    { label: 'Législatives', value: 'legislative' },
    { label: 'Locales', value: 'local' }
];

watch(selectedType, (newType) => {
    router.replace({ query: { ...route.query, type: newType === 'all' ? undefined : newType } });
});

// SEO avec Open Graph
useSeoMeta({
  title: 'Guide Électoral | Élections Sénégal',
  description: 'Apprenez comment voter au Sénégal : vidéos tutoriels, étapes du scrutin et conseils pour exercer votre droit de vote.',
  ogTitle: 'Guide Électoral - Élections Sénégal',
  ogDescription: 'Découvrez le processus de vote au Sénégal avec nos vidéos explicatives et guides pratiques.',
});
</script>

<template>
  <div class="min-h-screen pb-20">
    <!-- Header Compact -->
    <div class="bg-white dark:bg-gray-900 border-b dark:border-gray-800 pt-8 pb-6 shadow-sm">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Breadcrumb -->
        <UBreadcrumb
          class="mb-6"
          :links="[
            { label: 'Accueil', to: '/' },
            { label: 'Élections', to: '/elections-senegal' },
            { label: 'Guide Électoral' },
          ]"
        />

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-1">
            <h1 class="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">Guide de l'Électeur</h1>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-wider italic">Apprenez comment voter et découvrez les étapes du scrutin</p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
             <USelect
                v-model="selectedType"
                :options="electionTypes"
                size="md"
                class="w-full md:w-64"
                placeholder="Type d'élection"
                icon="i-heroicons-funnel"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 max-w-6xl py-12">
      <!-- Component reusing existing guide logic -->
      <ElectionsDashboardGuideElectoralVideos :type-election="selectedType" />
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
