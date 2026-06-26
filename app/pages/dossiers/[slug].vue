<script setup lang="ts">
import { dossierTypeLabel } from '~/config/dossiers.config';

const { siteName, siteUrl, defaultImage, keywords, themeColor } = useSiteMetadata();
const route = useRoute();

// Garde feature flag : 404 si la feature est désactivée
const { isFeatureEnabled, loading: flagsLoading } = useFeatureFlags();
watchEffect(() => {
  if (!flagsLoading.value && !isFeatureEnabled('menu_dossiers')) {
    throw createError({ statusCode: 404, statusMessage: 'Page non trouvée' });
  }
});

const slug = computed(() => route.params.slug as string);
const { dossier, loading, error } = useDossier(slug);

// 404 propre : dossier introuvable OU non publié (l'API renvoie 404 dans ce cas)
watchEffect(() => {
  if (!loading.value && (error.value || !dossier.value)) {
    throw createError({ statusCode: 404, statusMessage: 'Dossier non trouvé' });
  }
});

// Helpers
const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
const formatDateISO = (date?: string) => (date ? new Date(date).toISOString() : '');
const stripHtml = (html?: string) => (html ? html.replace(/<[^>]*>/g, '').trim() : '');

// ---- Helpers de présence (relations / blocs vides) ----
const has = <T,>(arr?: T[]): arr is T[] => Array.isArray(arr) && arr.length > 0;

// Sommaire dynamique : seules les sections renseignées apparaissent
const sections = computed(() => {
  const d = dossier.value;
  if (!d) return [];
  const list: { id: string; label: string }[] = [];
  if (has(d.highlights)) list.push({ id: 'a-retenir', label: 'À retenir' });
  if (d.intro_html || d.content_html) list.push({ id: 'introduction', label: 'Introduction' });
  if (has(d.documents)) list.push({ id: 'documents', label: 'Documents' });
  if (has(d.comparison)) list.push({ id: 'comparatif', label: 'Comparatif' });
  if (has(d.timeline)) list.push({ id: 'chronologie', label: 'Chronologie' });
  if (has(d.news)) list.push({ id: 'actualites', label: 'Actualités' });
  if (has(d.podcasts)) list.push({ id: 'videos', label: 'Vidéos' });
  if (has(d.public_entities)) list.push({ id: 'entites', label: 'Entités' });
  if (has(d.public_persons)) list.push({ id: 'personnalites', label: 'Personnalités' });
  if (has(d.faq)) list.push({ id: 'faq', label: 'FAQ' });
  if (has(d.sources)) list.push({ id: 'sources', label: 'Sources' });
  return list;
});

// ---- SEO (scope setup + getters réactifs → rendu SSR pour les crawlers) ----
const seoTitle = computed(() => {
  if (!dossier.value) return 'Chargement…';
  return dossier.value.seo_title || `${dossier.value.title} | Dossier Vie Publique Sénégal`;
});

const seoDescription = computed(() => {
  if (!dossier.value) return '';
  if (dossier.value.seo_description) return dossier.value.seo_description;
  const base = dossier.value.summary || stripHtml(dossier.value.intro_html) || dossier.value.title;
  return base.length > 160 ? `${base.substring(0, 157)}…` : base;
});

const url = computed(() => `${siteUrl}/dossiers/${slug.value}`);

// On construit l'URL absolue sans appeler useRuntimeConfig dans ce computed :
// il est lu par des getters useHead/useSeoMeta évalués hors du scope setup (SSR),
// or `useCmsImageAbsolute` → `useSiteMetadata` → `useRuntimeConfig` y planterait.
// `useCmsImage` est pur ; `siteUrl` est déjà capturé en setup.
const image = computed(() => {
  if (!dossier.value?.cover_image) return defaultImage;
  const rel = useCmsImage(dossier.value.cover_image);
  return rel.startsWith('http') ? rel : `${siteUrl}${rel}`;
});

const articleSchema = computed(() => {
  if (!dossier.value) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: dossier.value.title,
    description: seoDescription.value,
    image: { '@type': 'ImageObject', url: image.value, width: 1200, height: 630 },
    url: url.value,
    datePublished: formatDateISO(dossier.value.publish_date || dossier.value.date_created),
    dateModified: formatDateISO(
      dossier.value.date_updated || dossier.value.publish_date || dossier.value.date_created,
    ),
    author: { '@type': 'Organization', name: siteName, url: siteUrl },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: defaultImage },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url.value },
    about: { '@type': 'GovernmentOrganization', name: 'République du Sénégal' },
    articleSection: dossierTypeLabel(dossier.value.type) || 'Dossier',
    keywords: dossier.value.tags?.join(', ') || 'République du Sénégal',
    inLanguage: 'fr-SN',
  };
});

// Pas de BreadcrumbList ni WebPage en page : le @graph global de @nuxtjs/seo
// les émet déjà (breadcrumb auto-dérivé de la route). On ne garde que les nœuds
// d'entité propres à la page (Article, FAQPage).

const faqSchema = computed(() => {
  if (!has(dossier.value?.faq)) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dossier.value!.faq!.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: stripHtml(item.answer) },
    })),
  };
});

useSeoMeta({
  title: () => seoTitle.value,
  ogTitle: () => seoTitle.value,
  description: () => seoDescription.value,
  ogDescription: () => seoDescription.value,
  ogImage: () => image.value,
  ogImageAlt: () => dossier.value?.title || siteName,
  ogUrl: () => url.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: () => image.value,
  keywords: () =>
    [...keywords, ...(dossier.value?.tags || []), 'dossier Sénégal', 'vie publique Sénégal']
      .filter(Boolean)
      .join(', '),
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: () => [{ rel: 'canonical', href: url.value }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: siteName },
    {
      property: 'article:published_time',
      content: () => formatDateISO(dossier.value?.publish_date || dossier.value?.date_created),
    },
    {
      property: 'article:modified_time',
      content: () =>
        formatDateISO(
          dossier.value?.date_updated || dossier.value?.publish_date || dossier.value?.date_created,
        ),
    },
    { name: 'robots', content: 'index, follow, max-image-preview:large' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
  ],
  script: () =>
    [
      articleSchema.value && {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(articleSchema.value),
      },
      faqSchema.value && {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(faqSchema.value),
      },
    ].filter(Boolean),
});
</script>

<template>
  <!-- Pas de fond dark explicite : on hérite du body global (#15202B). -->
  <div class="min-h-screen bg-white pb-20 dark:bg-transparent">
    <div class="container mx-auto max-w-3xl px-4 py-4 md:py-6 lg:max-w-5xl">
      <AppBreadcrumb
        :items="[{ label: 'Dossiers', to: '/dossiers' }, { label: dossier?.title || 'Dossier' }]"
      />

      <!-- Loading -->
      <div v-if="loading" class="mt-2 space-y-6">
        <USkeleton class="aspect-[2/1] w-full rounded-xl" />
        <USkeleton class="h-8 w-2/3" />
        <USkeleton class="h-20 w-full" />
      </div>

      <!-- Contenu -->
      <div v-else-if="dossier" class="mt-2 lg:flex lg:gap-10">
        <article class="min-w-0 lg:flex-1">
          <DossierHero :dossier="dossier" />

          <!-- Sommaire mobile : barre d'onglets fine (masquée sur desktop, cf. sidebar) -->
          <nav
            v-if="sections.length > 1"
            aria-label="Sommaire du dossier"
            class="scrollbar-hide sticky top-0 z-30 -mx-4 mt-6 overflow-x-auto border-b border-gray-100 bg-white/90 px-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90 lg:hidden"
          >
            <ul class="flex gap-5 whitespace-nowrap">
              <li v-for="section in sections" :key="section.id">
                <a
                  :href="`#${section.id}`"
                  class="inline-flex border-b-2 border-transparent py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {{ section.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- Sections -->
          <div class="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
            <!-- 1. À retenir : résumé rapide / repères clés, AVANT le contenu détaillé -->
            <DossierSection
              id="a-retenir"
              title="À retenir"
              description="Les informations essentielles du dossier en un coup d'œil"
              :empty="!has(dossier.highlights)"
            >
              <DossierHighlights :items="dossier.highlights!" />
            </DossierSection>

            <!-- 2. Introduction éditoriale + contenu riche -->
            <DossierSection
              id="introduction"
              title="Introduction"
              :empty="!dossier.intro_html && !dossier.content_html"
            >
              <div
                v-if="dossier.intro_html"
                class="prose prose-base max-w-none text-gray-700 dark:prose-invert prose-headings:font-semibold prose-a:text-sky-600 dark:text-gray-300 dark:prose-a:text-sky-400"
                v-html="dossier.intro_html"
              />
              <div
                v-if="dossier.content_html"
                class="prose prose-base mt-6 max-w-none text-gray-700 dark:prose-invert prose-headings:font-semibold prose-h2:mt-8 prose-p:leading-relaxed prose-a:text-sky-600 prose-img:rounded-xl dark:text-gray-300 dark:prose-a:text-sky-400"
                v-html="dossier.content_html"
              />
            </DossierSection>

            <!-- 3. Documents liés -->
            <DossierSection id="documents" title="Documents liés" :empty="!has(dossier.documents)">
              <DossierRelatedDocuments :documents="dossier.documents!" />
            </DossierSection>

            <!-- 4. Comparatif ancien / nouveau -->
            <DossierSection
              id="comparatif"
              title="Comparatif"
              description="Ce qui change par rapport au texte précédent"
              :empty="!has(dossier.comparison)"
            >
              <DossierComparison :rows="dossier.comparison!" />
            </DossierSection>

            <!-- 5. Chronologie -->
            <DossierSection id="chronologie" title="Chronologie" :empty="!has(dossier.timeline)">
              <DossierTimeline :items="dossier.timeline!" />
            </DossierSection>

            <!-- 6. Actualités liées -->
            <DossierSection id="actualites" title="Actualités liées" :empty="!has(dossier.news)">
              <DossierRelatedNews :news="dossier.news!" />
            </DossierSection>

            <!-- 7. Vidéos / médias liés -->
            <DossierSection id="videos" title="Vidéos & médias" :empty="!has(dossier.podcasts)">
              <DossierRelatedVideos :videos="dossier.podcasts!" />
            </DossierSection>

            <!-- 8. Entités publiques concernées (ministères, agences, institutions…) -->
            <DossierSection
              id="entites"
              title="Institutions & entités concernées"
              :empty="!has(dossier.public_entities)"
            >
              <DossierRelatedEntities :entities="dossier.public_entities!" />
            </DossierSection>

            <!-- 9. Personnalités concernées -->
            <DossierSection
              id="personnalites"
              title="Personnalités concernées"
              :empty="!has(dossier.public_persons)"
            >
              <DossierRelatedPersons :persons="dossier.public_persons!" />
            </DossierSection>

            <!-- 10. FAQ -->
            <DossierSection id="faq" title="Questions fréquentes" :empty="!has(dossier.faq)">
              <DossierFaq :items="dossier.faq!" />
            </DossierSection>

            <!-- 11. Sources & ressources (liens internes ou externes) -->
            <DossierSection
              id="sources"
              title="Sources & ressources"
              description="Données, dashboards et liens utiles"
              :empty="!has(dossier.sources)"
            >
              <DossierLinks :links="dossier.sources!" />
            </DossierSection>

            <!-- Partage (mobile) -->
            <div class="border-t border-gray-100 pt-8 dark:border-gray-700 lg:hidden">
              <SocialShare :title="dossier.title" :url="url" />
            </div>
          </div>
        </article>

        <!-- Sidebar desktop : sommaire + partage, défile avec la page -->
        <aside class="hidden lg:block lg:w-56 lg:shrink-0">
          <div class="sticky top-6 space-y-6 pt-2">
            <nav v-if="sections.length > 1" aria-label="Sommaire du dossier">
              <p
                class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
              >
                Sur cette page
              </p>
              <ul class="space-y-0.5 border-l border-gray-100 dark:border-gray-700">
                <li v-for="section in sections" :key="section.id">
                  <a
                    :href="`#${section.id}`"
                    class="-ml-px block border-l-2 border-transparent py-1 pl-4 text-sm text-gray-500 transition-colors hover:border-sky-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400"
                  >
                    {{ section.label }}
                  </a>
                </li>
              </ul>
            </nav>

            <div class="border-t border-gray-100 pt-4 dark:border-gray-700">
              <SocialShare :title="dossier.title" :url="url" />
            </div>
          </div>
        </aside>
      </div>
    </div>

    <ScrollToTopButton />
  </div>
</template>

<style scoped>
:deep(.prose img) {
  @apply mx-auto rounded-xl;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
