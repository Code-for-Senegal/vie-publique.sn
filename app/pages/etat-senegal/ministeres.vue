<script setup lang="ts">
import { NuxtLink } from '#components'
import type { EtatOrganisationEntity } from '~~/types/etat-organisation'

const { entities, overview, pending } = useEtatOrganisation()
const route = useRoute()
const router = useRouter()

// ── Search synced to URL ──────────────────────────────────────────
const search = computed({
  get: () => (route.query.search as string) || '',
  set: (v: string) =>
    router.push({ query: { ...route.query, search: v || undefined } }),
})

const normalizeStr = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

// ── Filtered ministères ───────────────────────────────────────────
const ministeres = computed<EtatOrganisationEntity[]>(() => {
  const all = entities.value.filter(e => e.type_code === 'ministere')
  if (!search.value.trim()) return all
  const q = normalizeStr(search.value.trim())
  return all.filter(e => normalizeStr(e.name).includes(q))
})

const total = computed(() => entities.value.filter(e => e.type_code === 'ministere').length)

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

// ── SEO ───────────────────────────────────────────────────────────
useSeoMeta({
  title: "Ministères du Sénégal - Décret en vigueur",
  description:
    "Liste officielle des ministères du Sénégal selon le décret de répartition des services de l'État en vigueur. Retrouvez les coordonnées et informations de chaque ministère.",
  ogTitle: "Ministères du Sénégal",
  ogDescription:
    "Liste officielle des ministères selon le décret de répartition des services de l'État en vigueur.",
})

useHead({ title: "Ministères" })
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Organisation de l\'État', to: '/etat-senegal/organisation' },
        { label: 'Ministères' },
      ]"
      class="px-4"
    />

    <!-- ─── Hero ──────────────────────────────────────────────────── -->
    <section class="mx-auto mt-4 max-w-7xl px-4">
      <div
        class="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-7 shadow-sm dark:border-blue-900 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 sm:px-10 sm:py-8"
      >
        <div class="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-500/20" />
        <div class="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-800/20" />

        <div class="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
          <div class="flex-1">
            <!-- Decree badge + date -->
            <div class="mb-3 flex flex-wrap items-center gap-2">
              <span
                v-if="overview?.decree"
                class="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300"
              >
                <UIcon name="i-heroicons-document-text" class="h-3.5 w-3.5" />
                Décret n°&nbsp;{{ overview.decree.numero }}
              </span>
              <span
                v-if="overview?.decree?.date_publication"
                class="text-xs text-gray-500 dark:text-gray-400"
              >
                - en vigueur depuis le {{ formatDate(overview.decree.date_publication) }}
              </span>
            </div>

            <h1 class="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl lg:text-3xl">
              Ministères du Sénégal
            </h1>
            <p class="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Liste officielle des
              <span class="font-semibold text-emerald-700 dark:text-emerald-400">{{ total }}</span>
              ministère{{ total > 1 ? 's' : '' }} issus du décret de répartition des services de l'État en vigueur.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Search bar ───────────────────────────────────────────── -->
    <section class="mx-auto mt-6 max-w-7xl px-4">
      <div class="relative">
        <UIcon
          name="i-heroicons-magnifying-glass"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        />
        <input
          v-model="search"
          type="search"
          placeholder="Rechercher un ministère…"
          class="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
        />
        <button
          v-if="search"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Effacer la recherche"
          @click="search = ''"
        >
          <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
        </button>
      </div>

      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <template v-if="pending">Chargement…</template>
        <template v-else-if="search">
          {{ ministeres.length }} résultat{{ ministeres.length > 1 ? 's' : '' }}
          sur {{ total }} ministère{{ total > 1 ? 's' : '' }}
        </template>
        <template v-else>
          {{ total }} ministère{{ total > 1 ? 's' : '' }}
        </template>
      </p>
    </section>

    <!-- ─── Skeleton loader ──────────────────────────────────────── -->
    <section v-if="pending" class="mx-auto mt-6 max-w-7xl px-4">
      <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        <div class="h-10 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60" />
        <div
          v-for="i in 9"
          :key="i"
          class="flex h-14 animate-pulse items-center gap-4 border-b border-gray-100 px-4 last:border-0 dark:border-gray-800"
        >
          <div class="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </section>

    <!-- ─── No results ───────────────────────────────────────────── -->
    <section v-else-if="!ministeres.length" class="mx-auto mt-12 max-w-7xl px-4 text-center">
      <UIcon name="i-heroicons-building-office" class="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Aucun ministère trouvé{{ search ? ' pour "' + search + '"' : '' }}.
      </p>
      <button
        v-if="search"
        class="mt-3 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        @click="search = ''"
      >
        Effacer la recherche
      </button>
    </section>

    <!-- ─── Table ─────────────────────────────────────────────────── -->
    <section v-else class="mx-auto mt-6 max-w-7xl px-4">
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm dark:border-gray-700">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Ministères
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-900">
              <tr
                v-for="entity in ministeres"
                :key="entity.id"
                class="transition-colors hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10"
              >
                <!-- Nom -->
                <td class="px-4 py-3.5">
                  <component
                    :is="entity.has_public_page ? NuxtLink : 'span'"
                    :to="entity.has_public_page ? `/etat-senegal/${entity.public_slug}` : undefined"
                    class="text-sm font-medium leading-snug text-gray-900 dark:text-white"
                    :class="entity.has_public_page ? 'group/link inline-flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400' : ''"
                  >
                    {{ entity.name }}
                    <UIcon
                      v-if="entity.has_public_page"
                      name="i-heroicons-chevron-right"
                      class="h-4 w-4 shrink-0 text-gray-300 transition-colors group-hover/link:text-emerald-500"
                    />
                  </component>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
