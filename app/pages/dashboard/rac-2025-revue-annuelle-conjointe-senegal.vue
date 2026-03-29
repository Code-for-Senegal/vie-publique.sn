<script setup lang="ts">
definePageMeta({ ssr: false, layout: 'fullscreen' });

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }],
});

useSeoMeta({
  title: 'RAC 2025 - Revue annuelle conjointe du Sénégal',
  description:
    'Tableau de bord RAC 2025 du Sénégal : suivi de la mise en œuvre de la politique économique et sociale en 2024, indicateurs sectoriels, pôles territoriaux et cadre SND 2025-2029.',
  robots: 'noindex, nofollow, noarchive',
});

// ─── Données ────────────────────────────────────────────────────────
const { data: rac } = await useFetch<any>('/data/test-rac.json', {
  key: 'rac-2025',
  server: false,
  default: () => null,
});

const { data: poleMapping } = await useFetch<any>('/geo/senegal-mapping-pole-regions.json', {
  key: 'pole-mapping',
  server: false,
  default: () => null,
});

const isReady = computed(() => !!rac.value);

// ─── Données dérivées ───────────────────────────────────────────────
const overviewCards = computed(() => rac.value?.overview?.cards ?? []);
const highlights = computed<string[]>(() => rac.value?.overview?.highlights ?? []);
const challenges = computed<string[]>(() => rac.value?.overview?.challenges ?? []);
const sections = computed<any[]>(() => rac.value?.sections ?? []);
const territorialDatasets = computed<any[]>(() => rac.value?.territorial_poles?.datasets ?? []);
const snd = computed(() => rac.value?.snd_2025_2029);
const source = computed(() => rac.value?.source);

// ─── Groupes sectoriels avec couleurs et icônes citoyennes ──────────
const sectorGroups = computed(() => {
  const groups = [
    {
      key: 'secteurs_productifs',
      label: 'Secteurs productifs',
      subtitle: 'Agriculture, élevage, pêche, industrie',
      icon: 'i-heroicons-sun-20-solid',
      color: 'amber',
    },
    {
      key: 'secteurs_appui_production',
      label: 'Appui à la production',
      subtitle: 'Énergie, finances, numérique',
      icon: 'i-heroicons-bolt-20-solid',
      color: 'emerald',
    },
    {
      key: 'secteurs_sociaux',
      label: 'Secteurs sociaux',
      subtitle: 'Éducation, santé, eau, environnement',
      icon: 'i-heroicons-heart-20-solid',
      color: 'rose',
    },
    {
      key: 'gouvernance_paix_securite',
      label: 'Gouvernance',
      subtitle: 'Justice, gouvernance territoriale',
      icon: 'i-heroicons-shield-check-20-solid',
      color: 'violet',
    },
  ];
  return groups
    .map((g) => ({
      ...g,
      sections: sections.value.filter((s: any) => s.group === g.key),
    }))
    .filter((g) => g.sections.length > 0);
});

// ─── Statut document ────────────────────────────────────────────────
const statusLabels: Record<string, string> = {
  technical_validation: 'Validation technique',
  draft: 'Brouillon',
  published: 'Publié',
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-12 dark:bg-gray-950">
    <!-- Loading -->
    <div v-if="!isReady" class="flex h-screen items-center justify-center">
      <div class="text-center">
        <div
          class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"
        />
        <p class="text-sm text-gray-500">Chargement des données RAC 2025...</p>
      </div>
    </div>

    <div v-if="isReady" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <AppBreadcrumb :items="[{ label: 'Dashboard' }, { label: 'RAC 2025' }]" />

      <!-- ════════════ HERO ════════════ -->
      <header class="mb-10 mt-2 text-center">
        <span
          v-if="rac.year_label"
          class="mb-3 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm font-bold text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
        >
          {{ rac.year_label }}
        </span>
        <h1
          class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        >
          Revue annuelle conjointe
          <span class="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
            Sénégal
          </span>
        </h1>
        <p class="mx-auto mt-3 max-w-xl text-lg text-gray-500 dark:text-gray-400">
          {{ rac.subtitle }}
        </p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span
            v-if="rac.status"
            class="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          >
            {{ statusLabels[rac.status] ?? rac.status }}
          </span>
          <span v-if="source" class="text-xs text-gray-400 dark:text-gray-600">
            {{ source.institution }}
          </span>
        </div>
      </header>

      <!-- ════════════ SECTION 1 : CHIFFRES CLÉS ════════════ -->
      <section class="mb-12">
        <h2
          class="mb-5 text-center text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl"
        >
          Chiffres clés 2024
        </h2>
        <RacOverviewCards :cards="overviewCards" />
      </section>

      <!-- ════════════ SECTION 2 : À RETENIR ════════════ -->
      <section class="mb-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Ce qui s'améliore -->
        <div
          v-if="highlights.length"
          class="rounded-2xl border-2 border-emerald-200/60 bg-emerald-50/60 p-6 dark:border-emerald-900/30 dark:bg-emerald-950/20"
        >
          <div class="mb-4 flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10"
            >
              <UIcon
                name="i-heroicons-arrow-trending-up-20-solid"
                class="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <h3 class="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              Ce qui s'améliore
            </h3>
          </div>
          <ul class="space-y-3">
            <li
              v-for="(h, i) in highlights"
              :key="i"
              class="flex items-start gap-2 text-base leading-relaxed text-emerald-800 dark:text-emerald-300"
            >
              <UIcon
                name="i-heroicons-check-circle-20-solid"
                class="mt-1 h-5 w-5 flex-shrink-0 text-emerald-500"
              />
              {{ h }}
            </li>
          </ul>
        </div>

        <!-- Points de vigilance -->
        <div
          v-if="challenges.length"
          class="rounded-2xl border-2 border-amber-200/60 bg-amber-50/60 p-6 dark:border-amber-900/30 dark:bg-amber-950/20"
        >
          <div class="mb-4 flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-400/10"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle-20-solid"
                class="h-5 w-5 text-amber-600 dark:text-amber-400"
              />
            </div>
            <h3 class="text-lg font-bold text-amber-800 dark:text-amber-300">
              Points de vigilance
            </h3>
          </div>
          <ul class="space-y-3">
            <li
              v-for="(c, i) in challenges"
              :key="i"
              class="flex items-start gap-2 text-base leading-relaxed text-amber-800 dark:text-amber-300"
            >
              <UIcon
                name="i-heroicons-exclamation-circle-20-solid"
                class="mt-1 h-5 w-5 flex-shrink-0 text-amber-500"
              />
              {{ c }}
            </li>
          </ul>
        </div>
      </section>

      <!-- ════════════ SECTION 3 : CARTE TERRITORIALE ════════════ -->
      <section v-if="poleMapping && territorialDatasets.length" class="mb-12">
        <h2
          class="mb-5 text-center text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl"
        >
          Répartition territoriale
        </h2>
        <RacMapByPole :datasets="territorialDatasets" :pole-mapping="poleMapping" />
      </section>

      <!-- ════════════ SECTION 4 : BILAN PAR SECTEUR ════════════ -->
      <section class="mb-12">
        <h2
          class="mb-6 text-center text-xl font-extrabold text-gray-900 dark:text-white sm:text-2xl"
        >
          Bilan par secteur
        </h2>

        <div v-for="group in sectorGroups" :key="group.key" class="mb-8 last:mb-0">
          <!-- En-tête du groupe -->
          <div class="mb-4 flex items-center gap-3">
            <UIcon :name="group.icon" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">
                {{ group.label }}
              </h3>
              <p class="text-xs text-gray-400 dark:text-gray-500">{{ group.subtitle }}</p>
            </div>
          </div>

          <!-- Cartes sectorielles -->
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RacSectionCard
              v-for="section in group.sections"
              :key="section.id"
              :section="section"
              :max-metrics="3"
              :color="group.color"
              :icon="group.icon"
            />
          </div>
        </div>
      </section>

      <!-- ════════════ SECTION 5 : MÉTHODOLOGIE & SOURCES (accordéon) ════════════ -->
      <section v-if="snd" class="mb-10">
        <RacSndTargets
          :setup-process="snd.setup_process"
          :targets="snd.targets"
          :example-indicators="snd.example_indicators_without_targets_in_slide"
        />
      </section>

      <!-- ════════════ FOOTER SOURCE ════════════ -->
      <footer
        class="rounded-2xl border border-gray-200 bg-white px-6 py-5 dark:border-gray-800/50 dark:bg-gray-900/40"
      >
        <div class="flex items-start gap-3">
          <UIcon
            name="i-heroicons-information-circle-20-solid"
            class="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
          />
          <div>
            <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300">Source</h4>
            <p v-if="source" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {{ source.document_title }}
            </p>
            <p v-if="source" class="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {{ source.institution }} — {{ source.producer }}
            </p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>
