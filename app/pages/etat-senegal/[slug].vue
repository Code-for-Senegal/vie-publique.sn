<script setup lang="ts">
const route = useRoute();
const slug = computed(() => route.params.slug as string);

const { decree, entity, children, breadcrumb, pending, error } = useEtatOrganisationEntity(slug);

watchEffect(() => {
  if (error.value) {
    throw createError({ statusCode: 404, statusMessage: 'Entité publique introuvable' });
  }
});

const formatDate = (v?: string) =>
  v
    ? new Date(v).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

const TYPE_ICONS: Record<string, string> = {
  presidence: 'i-heroicons-building-library',
  primature: 'i-heroicons-building-office-2',
  ministere: 'i-heroicons-building-office',
  cabinet: 'i-heroicons-users',
  direction: 'i-heroicons-map-pin',
  service: 'i-heroicons-squares-2x2',
  etablissement_public: 'i-heroicons-academic-cap',
  societe_nationale: 'i-heroicons-building-storefront',
  societe_participation_publique: 'i-heroicons-building-storefront',
  agence: 'i-heroicons-megaphone',
  entite_regroupement: 'i-heroicons-folder-open',
};

const TYPE_BG_COLORS: Record<string, string> = {
  presidence: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  primature: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  ministere: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  cabinet: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  direction: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  service: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  etablissement_public: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  societe_nationale: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  societe_participation_publique:
    'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  agence: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const entityTypeIcon = computed(
  () => TYPE_ICONS[entity.value?.type_code ?? ''] || 'i-heroicons-building-office',
);
const entityTypeBg = computed(
  () => TYPE_BG_COLORS[entity.value?.type_code ?? ''] || 'bg-gray-100 text-gray-600',
);

// Budget link condition: has public page AND has a code_institution
const hasBudget = computed(
  () => entity.value?.has_public_page && entity.value?.code_institution != null,
);

// Types displayed as collapsible sections (with nested subchildren)
const GROUPING_TYPES = new Set(['entite_regroupement']);

// Types grouped into virtual accordion sections (grouped by type, items are the entities themselves)
const SOCIETE_TYPES = new Set([
  'etablissement_public',
  'societe_nationale',
  'societe_participation_publique',
]);

const VIRTUAL_GROUP_LABELS: Record<string, string> = {
  etablissement_public: 'Établissements publics',
  societe_nationale: 'Sociétés nationales',
  societe_participation_publique: 'Sociétés à participation publique',
};

const groupingChildren = computed(() =>
  children.value.filter((c) => GROUPING_TYPES.has(c.type_code)),
);

// Virtual accordion sections: one per societe type that has at least one child
const societeGroupSections = computed(() => {
  const groups = new Map<
    string,
    { id: string; code: string; label: string; items: typeof children.value }
  >();
  for (const child of children.value.filter((c) => SOCIETE_TYPES.has(c.type_code))) {
    if (!groups.has(child.type_code)) {
      groups.set(child.type_code, {
        id: `__group__${child.type_code}`,
        code: child.type_code,
        label: VIRTUAL_GROUP_LABELS[child.type_code] || child.type_label,
        items: [],
      });
    }
    groups.get(child.type_code)!.items.push(child);
  }
  return Array.from(groups.values());
});

const directChildrenByType = computed(() => {
  const groups = new Map<string, { code: string; label: string; items: typeof children.value }>();
  for (const child of children.value.filter(
    (c) => !GROUPING_TYPES.has(c.type_code) && !SOCIETE_TYPES.has(c.type_code),
  )) {
    if (!groups.has(child.type_code)) {
      groups.set(child.type_code, { code: child.type_code, label: child.type_label, items: [] });
    }
    groups.get(child.type_code)!.items.push(child);
  }
  return Array.from(groups.values());
});

// Open-set approach: missing key = closed by default
const openSections = ref<Record<string, boolean>>({});
const getIsOpen = (id: string) => openSections.value[id] === true;
const toggleSection = (id: string) => {
  openSections.value = { ...openSections.value, [id]: !getIsOpen(id) };
};

// Social media platform icons
const SOCIAL_ICONS: Record<string, string> = {
  facebook: 'i-simple-icons-facebook',
  twitter: 'i-simple-icons-twitter',
  x: 'i-simple-icons-x',
  linkedin: 'i-simple-icons-linkedin',
  instagram: 'i-simple-icons-instagram',
  youtube: 'i-simple-icons-youtube',
  tiktok: 'i-simple-icons-tiktok',
  telegram: 'i-simple-icons-telegram',
  whatsapp: 'i-simple-icons-whatsapp',
};
const getSocialIcon = (platform: string) =>
  SOCIAL_ICONS[platform.toLowerCase()] || 'i-heroicons-globe-alt';

// Can use main + sidebar layout (for top-level entities with children)
const hasMainContent = computed(() => children.value.length > 0);

// ── Body éditorial repliable (UX mobile : ne pas repousser les structures) ──
const bodyExpanded = ref(false);
// On ne clampe (et n'affiche « Lire la suite ») que si le body est long.
const isBodyLong = computed(() => (entity.value?.body?.length ?? 0) > 600);

// ── FAQ ─────────────────────────────────────────────────────────────
const faqItems = computed(() => (entity.value?.faq ?? []).filter((f) => f?.question && f?.answer));

const { siteName, siteUrl, themeColor, keywords } = useSiteMetadata();

const pageTitle = computed(() =>
  entity.value
    ? `${entity.value.name} | Organisation de l'État du Sénégal`
    : "Entité publique | Organisation de l'État du Sénégal",
);

const pageDescription = computed(() => {
  if (!entity.value) return "Fiche d'une entité publique de l'État du Sénégal.";
  // Si une description éditoriale existe, elle prime (meta plus pertinente).
  if (entity.value.description) return entity.value.description;
  const parts: string[] = [];
  parts.push(
    `${entity.value.name}, ${entity.value.type_label.toLowerCase()} de l'État du Sénégal.`,
  );
  if (entity.value.parent_name) {
    parts.push(`Rattaché à ${entity.value.parent_name}.`);
  }
  if (children.value.length > 0) {
    parts.push(
      `Comprend ${children.value.length} structure${children.value.length > 1 ? 's' : ''} rattachée${children.value.length > 1 ? 's' : ''}.`,
    );
  }
  if (decree.value?.numero) {
    parts.push(`Source : décret n° ${decree.value.numero}.`);
  }
  return parts.join(' ');
});

const pageUrl = computed(() => `${siteUrl}/etat-senegal/${slug.value}`);

const toAbsoluteCms = (id: string) => {
  const rel = useCmsImage(id);
  return rel.startsWith('http') ? rel : `${siteUrl}${rel}`;
};

// og:image : la couverture paysage d'abord (meilleur rendu social qu'un logo carré),
// puis le logo, puis le visuel par défaut.
const ogImage = computed(() => {
  if (entity.value?.cover_image) return toAbsoluteCms(entity.value.cover_image);
  if (entity.value?.logo) return toAbsoluteCms(entity.value.logo);
  return `${siteUrl}/nomination-3.png`;
});

useSeoMeta({
  title: pageTitle,
  ogTitle: pageTitle,
  description: pageDescription,
  ogDescription: pageDescription,
  ogImage,
  ogUrl: pageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: ogImage,
  keywords: computed(() =>
    [
      ...keywords,
      entity.value?.name || '',
      entity.value?.type_label || '',
      entity.value?.parent_name || '',
      'organisation état Sénégal',
    ].join(', '),
  ),
});

const organizationSchema = computed(() => {
  if (!entity.value) return null;
  const publicChildren = children.value.filter((c) => c.has_public_page);
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: entity.value.name,
    description: pageDescription.value,
    url: pageUrl.value,
    inLanguage: 'fr-SN',
    areaServed: { '@type': 'Country', name: 'Sénégal' },
    ...(entity.value.web_site && { sameAs: entity.value.web_site }),
    ...(entity.value.email && { email: entity.value.email }),
    ...(entity.value.phone && { telephone: entity.value.phone }),
    ...(entity.value.adresse && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: entity.value.adresse,
        addressCountry: 'SN',
      },
    }),
    ...(entity.value.logo && { logo: toAbsoluteCms(entity.value.logo) }),
    ...(entity.value.cover_image && { image: toAbsoluteCms(entity.value.cover_image) }),
    ...(entity.value.parent_name && {
      parentOrganization: {
        '@type': 'GovernmentOrganization',
        name: entity.value.parent_name,
      },
    }),
    ...(publicChildren.length > 0 && {
      subOrganization: publicChildren.map((c) => ({
        '@type': 'GovernmentOrganization',
        name: c.name,
        url: `${siteUrl}/etat-senegal/${c.public_slug}`,
      })),
    }),
  };
});

const faqSchema = computed(() => {
  if (!faqItems.value.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.value.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
});

// Breadcrumb : émis par <AppBreadcrumb> (source unique du fil d'Ariane, §7 CLAUDE.md).

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: pageUrl }],
  meta: [
    {
      name: 'robots',
      content: computed(() => (entity.value ? 'index, follow' : 'noindex, nofollow')),
    },
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: 'fr_SN' },
  ],
  script: computed(() => {
    const scripts = [];
    if (organizationSchema.value) {
      scripts.push({
        key: 'ld-organization',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(organizationSchema.value),
      });
    }
    if (faqSchema.value) {
      scripts.push({
        key: 'ld-faq',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(faqSchema.value),
      });
    }
    return scripts;
  }),
});
</script>

<template>
  <div class="min-h-screen pb-20">
    <AppBreadcrumb
      :items="[
        { label: 'État du Sénégal', to: '/etat-senegal' },
        { label: 'Organisation', to: '/etat-senegal/organisation' },
        ...breadcrumb.map((p) => ({ label: p.name, to: `/etat-senegal/${p.public_slug}` })),
        { label: entity?.name || 'Détail' },
      ]"
      class="px-4"
    />

    <!-- Loading -->
    <section v-if="pending" class="flex flex-col items-center gap-3 py-20">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-blue-500" />
      <p class="text-sm text-gray-500">Chargement de la fiche…</p>
    </section>

    <template v-else-if="entity">
      <!-- ─── Header ──────────────────────────────────────────────── -->
      <section class="mx-auto mt-4 max-w-7xl px-4">
        <div
          class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/50 sm:p-8"
        >
          <div class="flex items-center gap-5">
            <!-- Logo ou icône selon disponibilité -->
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl"
              :class="
                entity.logo ? 'border border-gray-200 bg-white dark:border-gray-700' : entityTypeBg
              "
            >
              <CmsImage
                v-if="entity.logo"
                :src="entity.logo"
                :alt="entity.name"
                :width="64"
                :height="64"
                sizes="64px"
                class="h-full w-full object-contain"
                loading="eager"
                fetch-priority="high"
              />
              <UIcon v-else :name="entityTypeIcon" class="h-8 w-8" />
            </div>

            <!-- Title block -->
            <div class="min-w-0 flex-1">
              <h1
                class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl"
              >
                {{ entity.name }}
              </h1>

              <p
                v-if="entity.parent_name"
                class="mt-2 flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300"
              >
                <UIcon name="i-heroicons-arrow-up" class="h-4 w-4 text-gray-400" />
                Rattaché à <span class="font-medium">{{ entity.parent_name }}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── Content ────────────────────────────────────────────── -->
      <section class="mx-auto mt-6 max-w-7xl px-4">
        <div class="grid gap-6 xl:grid-cols-3">
          <!-- Main column: tabs + aperçu or historique -->
          <div class="xl:col-span-2">
            <!-- Tab switcher: hidden -->

            <!-- ── Aperçu ──────────────────────────────────────────── -->
            <div>
              <!-- Présentation : le body riche prime (il porte ses propres titres).
                   Le chapô (description) ne s'affiche que s'il n'y a PAS de body, pour
                   éviter le doublon de titre/intro. -->
              <div
                v-if="entity.description || entity.body"
                class="mb-6 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div
                  v-if="!entity.body"
                  class="border-b border-gray-100 px-5 py-3 dark:border-gray-700"
                >
                  <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Présentation</h2>
                </div>
                <div class="px-5 py-4">
                  <!-- Chapô : seulement quand il n'y a pas de body -->
                  <p
                    v-if="entity.description && !entity.body"
                    class="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    {{ entity.description }}
                  </p>

                  <!-- Body riche : clampé si long, avec fondu + « Lire la suite » -->
                  <div v-if="entity.body" class="relative">
                    <div
                      class="prose-a:text-primary-600 dark:prose-a:text-primary-400 prose prose-sm max-w-none overflow-hidden transition-all prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-900 prose-li:text-gray-600 prose-img:rounded-xl dark:prose-headings:text-white dark:prose-p:text-gray-300 dark:prose-strong:text-white dark:prose-li:text-gray-300"
                      :class="isBodyLong && !bodyExpanded ? 'max-h-64' : ''"
                      v-html="entity.body"
                    />
                    <div
                      v-if="isBodyLong && !bodyExpanded"
                      class="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-gray-800"
                    />
                  </div>

                  <button
                    v-if="isBodyLong"
                    type="button"
                    class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    @click="bodyExpanded = !bodyExpanded"
                  >
                    {{ bodyExpanded ? 'Réduire' : 'Lire la suite' }}
                    <UIcon
                      :name="bodyExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                      class="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              <!-- Children -->
              <div
                v-if="hasMainContent"
                class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div
                  class="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-700"
                >
                  <div>
                    <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                      Organisation administrative
                    </h2>
                    <p class="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      Explorez les services, directions, établissements publics et autres organismes
                      rattachés.
                    </p>
                  </div>
                </div>

                <!-- Grouping sections (entite_regroupement as collapsible sections) -->
                <div
                  v-for="(group, gi) in groupingChildren"
                  :key="group.id"
                  :class="[
                    gi < groupingChildren.length - 1 ||
                    societeGroupSections.length > 0 ||
                    directChildrenByType.length > 0
                      ? 'border-b border-gray-100 dark:border-gray-700'
                      : '',
                  ]"
                >
                  <!-- Accordion: only when there are sub-children -->
                  <template v-if="(group.subchildren || []).length > 0">
                    <button
                      class="flex w-full items-center gap-2 px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      @click="toggleSection(group.id)"
                    >
                      <span
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                        :class="TYPE_BG_COLORS[group.type_code] || 'bg-amber-100 text-amber-600'"
                      >
                        <UIcon
                          :name="TYPE_ICONS[group.type_code] || 'i-heroicons-folder-open'"
                          class="h-3.5 w-3.5"
                        />
                      </span>
                      <span class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
                        {{ group.name }}
                      </span>
                      <span class="text-xs text-gray-400">
                        {{ group.subchildren.length }}
                      </span>
                      <UIcon
                        :name="
                          getIsOpen(group.id)
                            ? 'i-heroicons-chevron-down'
                            : 'i-heroicons-chevron-right'
                        "
                        class="h-4 w-4 shrink-0 text-gray-400"
                      />
                    </button>

                    <div
                      v-if="getIsOpen(group.id)"
                      class="divide-y divide-gray-50 dark:divide-gray-800/60"
                    >
                      <div
                        v-for="sub in group.subchildren"
                        :key="sub.id"
                        class="flex items-center gap-3 py-2 pl-14 pr-5 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <span
                          class="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                          :class="TYPE_BG_COLORS[sub.type_code] || 'bg-gray-100 text-gray-500'"
                        >
                          <UIcon
                            :name="TYPE_ICONS[sub.type_code] || 'i-heroicons-building-office'"
                            class="h-3 w-3"
                          />
                        </span>
                        <div class="min-w-0 flex-1">
                          <NuxtLink
                            v-if="sub.has_public_page"
                            :to="`/etat-senegal/${sub.public_slug}`"
                            class="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                          >
                            {{ sub.name }}
                          </NuxtLink>
                          <span v-else class="text-sm text-gray-600 dark:text-gray-400">
                            {{ sub.name }}
                          </span>
                        </div>
                        <UIcon
                          v-if="sub.has_public_page"
                          name="i-heroicons-arrow-top-right-on-square"
                          class="h-3.5 w-3.5 shrink-0 text-gray-300"
                        />
                      </div>
                    </div>
                  </template>

                  <!-- Plain row: no sub-children, no accordion -->
                  <div v-else class="flex items-center gap-2 px-5 py-3">
                    <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                      :class="TYPE_BG_COLORS[group.type_code] || 'bg-amber-100 text-amber-600'"
                    >
                      <UIcon
                        :name="TYPE_ICONS[group.type_code] || 'i-heroicons-folder-open'"
                        class="h-3.5 w-3.5"
                      />
                    </span>
                    <NuxtLink
                      v-if="group.has_public_page"
                      :to="`/etat-senegal/${group.public_slug}`"
                      class="flex-1 text-sm font-medium text-gray-800 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
                    >
                      {{ group.name }}
                    </NuxtLink>
                    <span
                      v-else
                      class="flex-1 text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      {{ group.name }}
                    </span>
                  </div>
                </div>

                <!-- Sociétés nationales / à participation publique: virtual accordion sections -->
                <div
                  v-for="(group, gi) in societeGroupSections"
                  :key="group.id"
                  :class="
                    gi < societeGroupSections.length - 1 || directChildrenByType.length > 0
                      ? 'border-b border-gray-100 dark:border-gray-700'
                      : ''
                  "
                >
                  <button
                    class="flex w-full items-center gap-2 px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    @click="toggleSection(group.id)"
                  >
                    <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                      :class="TYPE_BG_COLORS[group.code] || 'bg-gray-100 text-gray-500'"
                    >
                      <UIcon
                        :name="TYPE_ICONS[group.code] || 'i-heroicons-building-storefront'"
                        class="h-3.5 w-3.5"
                      />
                    </span>
                    <span class="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{{
                      group.label
                    }}</span>
                    <span class="text-xs text-gray-400">{{ group.items.length }}</span>
                    <UIcon
                      :name="
                        getIsOpen(group.id)
                          ? 'i-heroicons-chevron-down'
                          : 'i-heroicons-chevron-right'
                      "
                      class="h-4 w-4 shrink-0 text-gray-400"
                    />
                  </button>

                  <div
                    v-if="getIsOpen(group.id)"
                    class="divide-y divide-gray-50 dark:divide-gray-800/60"
                  >
                    <div
                      v-for="item in group.items"
                      :key="item.id"
                      class="flex items-center gap-3 py-2 pl-14 pr-5 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <span
                        class="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                        :class="TYPE_BG_COLORS[item.type_code] || 'bg-gray-100 text-gray-500'"
                      >
                        <UIcon
                          :name="TYPE_ICONS[item.type_code] || 'i-heroicons-building-storefront'"
                          class="h-3 w-3"
                        />
                      </span>
                      <div class="min-w-0 flex-1">
                        <NuxtLink
                          v-if="item.has_public_page"
                          :to="`/etat-senegal/${item.public_slug}`"
                          class="text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                        >
                          {{ item.name }}
                        </NuxtLink>
                        <span v-else class="text-sm text-gray-600 dark:text-gray-400">{{
                          item.name
                        }}</span>
                      </div>
                      <UIcon
                        v-if="item.has_public_page"
                        name="i-heroicons-arrow-top-right-on-square"
                        class="h-3.5 w-3.5 shrink-0 text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <!-- Direct children grouped by type (non-regroupement) -->
                <div
                  v-for="(group, gi) in directChildrenByType"
                  :key="group.code"
                  :class="
                    gi < directChildrenByType.length - 1
                      ? 'border-b border-gray-100 dark:border-gray-700'
                      : ''
                  "
                >
                  <div class="flex items-center gap-2 px-5 py-2.5">
                    <span
                      class="flex h-6 w-6 items-center justify-center rounded"
                      :class="TYPE_BG_COLORS[group.code] || 'bg-gray-100 text-gray-500'"
                    >
                      <UIcon
                        :name="TYPE_ICONS[group.code] || 'i-heroicons-building-office'"
                        class="h-3.5 w-3.5"
                      />
                    </span>
                    <span
                      class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                    >
                      {{ group.label }}
                    </span>
                    <span
                      class="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800"
                    >
                      {{ group.items.length }}
                    </span>
                  </div>

                  <div class="divide-y divide-gray-100 dark:divide-gray-800">
                    <div
                      v-for="child in group.items"
                      :key="child.id"
                      class="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    >
                      <div class="min-w-0 flex-1">
                        <NuxtLink
                          v-if="child.has_public_page"
                          :to="`/etat-senegal/${child.public_slug}`"
                          class="block text-sm font-medium text-gray-800 hover:text-blue-700 dark:text-gray-100 dark:hover:text-blue-400"
                        >
                          {{ child.name }}
                        </NuxtLink>
                        <span v-else class="block text-sm text-gray-600 dark:text-gray-400">
                          {{ child.name }}
                        </span>
                      </div>
                      <UIcon
                        v-if="child.has_public_page"
                        name="i-heroicons-arrow-top-right-on-square"
                        class="h-3.5 w-3.5 shrink-0 text-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── FAQ ──────────────────────────────────────────────── -->
            <div
              v-if="faqItems.length"
              class="mt-6 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div class="border-b border-gray-100 px-5 py-3 dark:border-gray-700">
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                  Questions fréquentes
                </h2>
              </div>
              <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <details v-for="(item, i) in faqItems" :key="i" class="group px-5 py-3">
                  <summary
                    class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-gray-800 dark:text-gray-100"
                  >
                    {{ item.question }}
                    <UIcon
                      name="i-heroicons-chevron-down"
                      class="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p
                    class="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300"
                  >
                    {{ item.answer }}
                  </p>
                </details>
              </div>
            </div>

            <!-- ── Historique : hidden ── -->
          </div>

          <!-- Sidebar: always on the right column on desktop -->
          <div class="space-y-5 xl:col-span-1">
            <!-- Budget link -->
            <div
              v-if="hasBudget"
              class="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20"
            >
              <div class="mb-3 flex items-center gap-2">
                <UIcon name="i-heroicons-chart-bar" class="h-5 w-5 text-blue-600" />
                <h2 class="text-sm font-semibold text-blue-800 dark:text-blue-300">Budget</h2>
              </div>
              <p class="mb-4 text-xs text-blue-700 dark:text-blue-400">
                Consultez le budget détaillé, l'évolution par année et la répartition par
                programmes.
              </p>
              <UButton
                :to="`/budget-senegal/${entity.public_slug}`"
                color="blue"
                variant="solid"
                size="sm"
                icon="i-heroicons-chart-bar"
                block
              >
                Voir le budget détaillé
              </UButton>
            </div>

            <!-- Coordonnées -->
            <div
              v-if="
                entity.email ||
                entity.phone ||
                entity.adresse ||
                entity.web_site ||
                (entity.reseaux_sociaux && Object.keys(entity.reseaux_sociaux).length)
              "
              class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div class="border-b border-gray-100 px-5 py-3 dark:border-gray-700">
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Coordonnées</h2>
              </div>
              <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <div v-if="entity.adresse" class="flex items-start gap-3 px-5 py-3">
                  <UIcon name="i-heroicons-map-pin" class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p class="text-xs text-gray-500">Adresse</p>
                    <p class="text-sm text-gray-800 dark:text-gray-100">{{ entity.adresse }}</p>
                  </div>
                </div>
                <div v-if="entity.phone" class="flex items-start gap-3 px-5 py-3">
                  <UIcon name="i-heroicons-phone" class="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <p class="text-xs text-gray-500">Téléphone</p>
                    <a
                      :href="`tel:${entity.phone}`"
                      class="text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >{{ entity.phone }}</a
                    >
                  </div>
                </div>
                <div v-if="entity.email" class="flex items-start gap-3 px-5 py-3">
                  <UIcon
                    name="i-heroicons-envelope"
                    class="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                  />
                  <div>
                    <p class="text-xs text-gray-500">Email</p>
                    <a
                      :href="`mailto:${entity.email}`"
                      class="break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >{{ entity.email }}</a
                    >
                  </div>
                </div>
                <div v-if="entity.web_site" class="flex items-start gap-3 px-5 py-3">
                  <UIcon
                    name="i-heroicons-globe-alt"
                    class="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                  />
                  <div>
                    <p class="text-xs text-gray-500">Site web</p>
                    <a
                      :href="entity.web_site"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="break-all text-sm text-blue-600 hover:underline dark:text-blue-400"
                      >{{ entity.web_site }}</a
                    >
                  </div>
                </div>
                <div
                  v-if="entity.reseaux_sociaux && Object.keys(entity.reseaux_sociaux).length"
                  class="px-5 py-3"
                >
                  <p class="mb-2 text-xs text-gray-500">Réseaux sociaux</p>
                  <div class="flex flex-wrap gap-2">
                    <a
                      v-for="(url, platform) in entity.reseaux_sociaux"
                      :key="platform"
                      :href="url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <UIcon :name="getSocialIcon(platform as string)" class="h-3 w-3" />
                      {{ platform }}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Références légales -->
            <div
              class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div class="border-b border-gray-100 px-5 py-3 dark:border-gray-700">
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
                  Références légales
                </h2>
              </div>
              <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <div v-if="decree" class="flex items-start gap-3 px-5 py-3">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                  />
                  <div>
                    <p class="text-xs text-gray-500">Décret en vigueur</p>
                    <p class="text-sm text-gray-800 dark:text-gray-100">n° {{ decree.numero }}</p>
                  </div>
                </div>
                <div v-if="decree?.date_publication" class="flex items-start gap-3 px-5 py-3">
                  <UIcon
                    name="i-heroicons-calendar"
                    class="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                  />
                  <div>
                    <p class="text-xs text-gray-500">Date de publication</p>
                    <p class="text-sm text-gray-800 dark:text-gray-100">
                      {{ formatDate(decree.date_publication) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hiérarchie -->
            <div
              v-if="breadcrumb.length"
              class="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div class="border-b border-gray-100 px-5 py-3 dark:border-gray-700">
                <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Hiérarchie</h2>
              </div>
              <div class="divide-y divide-gray-100 px-5 dark:divide-gray-700">
                <NuxtLink
                  v-for="parent in breadcrumb"
                  :key="parent.public_slug"
                  :to="`/etat-senegal/${parent.public_slug}`"
                  class="flex items-center gap-2 py-2.5 text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                >
                  <UIcon name="i-heroicons-arrow-up" class="h-3.5 w-3.5 text-gray-400" />
                  {{ parent.name }}
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
