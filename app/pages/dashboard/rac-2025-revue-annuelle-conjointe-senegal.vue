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
const highlights = computed<string[]>(() => (rac.value?.overview?.highlights ?? []).slice(0, 4));
const challenges = computed<string[]>(() => (rac.value?.overview?.challenges ?? []).slice(0, 4));
const sections = computed<any[]>(() => rac.value?.sections ?? []);
const territorialDatasets = computed<any[]>(() => rac.value?.territorial_poles?.datasets ?? []);
const snd = computed(() => rac.value?.snd_2025_2029);
const source = computed(() => rac.value?.source);

// ─── Groupes sectoriels ─────────────────────────────────────────────
const sectorGroups = computed(() => {
  const groups = [
    {
      key: 'secteurs_productifs',
      label: 'Agriculture & production',
      icon: 'i-heroicons-sun-20-solid',
      color: 'amber',
    },
    {
      key: 'secteurs_appui_production',
      label: 'Industrie & services',
      icon: 'i-heroicons-bolt-20-solid',
      color: 'emerald',
    },
    {
      key: 'secteurs_sociaux',
      label: 'Secteurs sociaux',
      icon: 'i-heroicons-heart-20-solid',
      color: 'rose',
    },
    {
      key: 'gouvernance_paix_securite',
      label: 'Gouvernance',
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

// ─── Méthodologie (accordéon) ────────────────────────────────────────
const showMethodology = ref(false);
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-16 dark:bg-gray-950">
    <!-- Loading -->
    <div v-if="!isReady" class="flex h-screen items-center justify-center">
      <div class="text-center">
        <div
          class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
        />
        <p class="text-sm text-gray-500">Chargement des données RAC 2025...</p>
      </div>
    </div>

    <div v-if="isReady" class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <AppBreadcrumb :items="[{ label: 'Dashboard' }, { label: 'RAC 2025' }]" />

      <!-- ═══════════════════════════════════════════════════════════════
           1. HERO
           ═══════════════════════════════════════════════════════════════ -->
      <header class="mb-14 mt-4 text-center">
        <h1
          class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
        >
                  Tableau de bord national
          <span class="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-transparent">
            {{ rac.year_label }}
          </span>
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          Revue Annuelle Conjointe - Synthèse des résultats économiques et sociaux du Sénégal en 2024
        </p>
        <p class="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Version technique validée
          <span v-if="source"> — {{ source.institution }}</span>
        </p>
      </header>

      <!-- ═══════════════════════════════════════════════════════════════
           2. KPI — CHIFFRES CLÉS
           ═══════════════════════════════════════════════════════════════ -->
      <section class="mb-16">
        <RacOverviewCards :cards="overviewCards" :max="5" />
      </section>

      <!-- ═══════════════════════════════════════════════════════════════
           3. À RETENIR
           ═══════════════════════════════════════════════════════════════ -->
      <section class="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Ce qui s'améliore -->
        <div
          v-if="highlights.length"
          class="rounded-xl border border-gray-200 bg-emerald-50/30 p-6 dark:border-gray-700/40 dark:bg-emerald-950/10"
        >
          <div class="mb-5 flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20"
            >
              <UIcon
                name="i-heroicons-arrow-trending-up-20-solid"
                class="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Ce qui s'améliore</h2>
          </div>
          <ul class="space-y-3">
            <li
              v-for="(h, i) in highlights"
              :key="i"
              class="flex items-start gap-2.5 text-base leading-relaxed text-gray-700 dark:text-gray-300"
            >
              <UIcon
                name="i-heroicons-check-circle-20-solid"
                class="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-500"
              />
              {{ h }}
            </li>
          </ul>
        </div>

        <!-- Points de vigilance -->
        <div
          v-if="challenges.length"
          class="rounded-xl border border-gray-200 bg-amber-50/30 p-6 dark:border-gray-700/40 dark:bg-amber-950/10"
        >
          <div class="mb-5 flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20"
            >
              <UIcon
                name="i-heroicons-exclamation-triangle-20-solid"
                class="h-4 w-4 text-amber-600 dark:text-amber-400"
              />
            </div>
            <h2 class="text-base font-bold text-gray-900 dark:text-white">Points de vigilance</h2>
          </div>
          <ul class="space-y-3">
            <li
              v-for="(c, i) in challenges"
              :key="i"
              class="flex items-start gap-2.5 text-base leading-relaxed text-gray-700 dark:text-gray-300"
            >
              <UIcon
                name="i-heroicons-exclamation-circle-20-solid"
                class="mt-1 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500"
              />
              {{ c }}
            </li>
          </ul>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════
           4. CARTE TERRITORIALE
           ═══════════════════════════════════════════════════════════════ -->
      <section v-if="poleMapping && territorialDatasets.length" class="mb-16">
        <h2 class="mb-6 text-center text-xl font-bold text-gray-900 dark:text-white">
          Répartition territoriale
        </h2>
        <RacMapByPole :datasets="territorialDatasets" :pole-mapping="poleMapping" />
      </section>

      <!-- ═══════════════════════════════════════════════════════════════
           5. BILAN PAR SECTEUR
           ═══════════════════════════════════════════════════════════════ -->
      <section class="mb-16">
        <h2 class="mb-8 text-center text-xl font-bold text-gray-900 dark:text-white">
          Bilan par secteur
        </h2>

        <div v-for="group in sectorGroups" :key="group.key" class="mb-10 last:mb-0">
          <h3
            class="mb-4 flex items-center gap-2 text-base font-bold text-gray-700 dark:text-gray-300"
          >
            <UIcon :name="group.icon" class="h-5 w-5" />
            {{ group.label }}
          </h3>
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RacSectionCard
              v-for="section in group.sections"
              :key="section.id"
              :section="section"
              :max-metrics="2"
              :color="group.color"
              :icon="group.icon"
            />
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════════════════════
           6. SND 2025-2029 (SIMPLIFIÉ)
           ═══════════════════════════════════════════════════════════════ -->
      <section v-if="snd" class="mb-16">
        <h2 class="mb-6 text-center text-xl font-bold text-gray-900 dark:text-white">
          Cadre SND 2025-2029
        </h2>
        <p class="mx-auto mb-8 max-w-xl text-center text-base text-gray-500 dark:text-gray-400">
          Objectifs nationaux de développement et cibles annuelles
        </p>
        <RacSndTargets
          :setup-process="snd.setup_process"
          :targets="snd.targets"
          :example-indicators="snd.example_indicators_without_targets_in_slide"
        />
      </section>

      <!-- ═══════════════════════════════════════════════════════════════
           7. MÉTHODOLOGIE & SOURCES
           ═══════════════════════════════════════════════════════════════ -->
      <section class="mb-6">
        <div
          class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700/40 dark:bg-gray-900/60"
        >
          <!-- Bouton accordéon -->
          <button
            class="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
            @click="showMethodology = !showMethodology"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-heroicons-document-text-20-solid" class="h-5 w-5 text-gray-400" />
              <div>
                <h2 class="text-base font-bold text-gray-900 dark:text-white">
                  Méthodologie & sources
                </h2>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Processus RAC, données source et détails techniques
                </p>
              </div>
            </div>
            <UIcon
              name="i-heroicons-chevron-down-20-solid"
              :class="[
                'h-5 w-5 text-gray-400 transition-transform duration-200',
                showMethodology ? 'rotate-180' : '',
              ]"
            />
          </button>

          <!-- Contenu déplié -->
          <div v-show="showMethodology" class="border-t border-gray-200 dark:border-gray-700/50">
            <!-- Source -->
            <div class="px-6 py-5">
              <h3 class="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                Source des données
              </h3>
              <p v-if="source" class="text-sm text-gray-600 dark:text-gray-400">
                {{ source.document_title }}
              </p>
              <p v-if="source" class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {{ source.institution }} — {{ source.producer }}
              </p>
            </div>

            <!-- Processus RAC -->
            <div v-if="snd" class="border-t border-gray-100 px-6 py-5 dark:border-gray-800">
              <h3 class="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">
                Processus de la Revue Annuelle Conjointe
              </h3>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(step, i) in snd.setup_process"
                  :key="i"
                  class="flex items-center gap-2"
                >
                  <span
                    class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {{ i + 1 }}
                  </span>
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ step }}</span>
                  <UIcon
                    v-if="i < snd.setup_process.length - 1"
                    name="i-heroicons-chevron-right-20-solid"
                    class="hidden h-4 w-4 text-gray-300 dark:text-gray-600 sm:block"
                  />
                </div>
              </div>
            </div>

            <!-- Note explicative -->
            <div class="border-t border-gray-100 px-6 py-5 dark:border-gray-800">
              <p class="text-xs italic text-gray-400 dark:text-gray-500">
                Données issues du document officiel RAC 2025 — Revue Annuelle Conjointe de la
                politique économique et sociale du Sénégal. Ce tableau de bord est une synthèse
                citoyenne simplifiée.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
