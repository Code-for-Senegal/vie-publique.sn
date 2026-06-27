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
const formatDateISO = (date?: string) => (date ? new Date(date).toISOString() : '');
const stripHtml = (html?: string) => (html ? html.replace(/<[^>]*>/g, '').trim() : '');

// ---- Helpers de présence (relations / blocs vides) ----
const has = <T,>(arr?: T[]): arr is T[] => Array.isArray(arr) && arr.length > 0;

// Sommaire dynamique : seules les sections renseignées apparaissent
const sections = computed(() => {
  const d = dossier.value;
  if (!d) return [];
  const list: { id: string; label: string }[] = [];
  // Ordre : d'abord l'essentiel concret (repères, documents/sources, calendrier,
  // ce qui change), PUIS l'analyse longue. Cf. demande produit (mobile-first).
  if (has(d.highlights)) list.push({ id: 'a-retenir', label: 'À retenir' });
  if (has(d.documents)) list.push({ id: 'documents', label: 'Documents' });
  if (has(d.timeline)) list.push({ id: 'chronologie', label: 'Chronologie' });
  if (has(d.comparison)) list.push({ id: 'comparatif', label: 'Comparatif' });
  if (d.intro_html || d.content_html) list.push({ id: 'introduction', label: 'Analyse' });
  if (has(d.news)) list.push({ id: 'actualites', label: 'Actualités' });
  if (has(d.podcasts)) list.push({ id: 'videos', label: 'Vidéos' });
  if (has(d.public_entities)) list.push({ id: 'entites', label: 'Entités' });
  if (has(d.public_persons)) list.push({ id: 'personnalites', label: 'Personnalités' });
  if (has(d.faq)) list.push({ id: 'faq', label: 'FAQ' });
  if (has(d.sources)) list.push({ id: 'sources', label: 'Sources' });
  return list;
});

// Tags affichés en pied d'article (« sujets liés »), limités pour rester sobres.
const dossierTags = computed(() => (dossier.value?.tags || []).slice(0, 10));

// Sommaire mobile déroulant (<details>) : refermé après sélection d'une ancre.
const mobileToc = ref<HTMLDetailsElement | null>(null);
const closeMobileToc = () => {
  if (mobileToc.value) mobileToc.value.open = false;
};

// ---- SEO (scope setup + getters réactifs → rendu SSR pour les crawlers) ----
const seoTitle = computed(() => {
  if (!dossier.value) return 'Chargement…';
  // La marque est ajoutée par le titleTemplate global → ne pas la répéter ici.
  return dossier.value.seo_title || dossier.value.title;
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
        key: 'ld-article',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(articleSchema.value),
      },
      faqSchema.value && {
        key: 'ld-faq',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(faqSchema.value),
      },
    ].filter(Boolean),
});
</script>

<template>
  <!-- Pas de fond dark explicite : on hérite du body global (#15202B). -->
  <!-- pb généreux sur mobile : la bottom-nav flottante ne doit pas masquer le contenu. -->
  <div class="min-h-screen bg-white pb-32 dark:bg-transparent lg:pb-12">
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

          <!-- Sommaire mobile : barre sticky fine + vrai menu déroulant (masqué sur desktop) -->
          <details
            v-if="sections.length > 1"
            ref="mobileToc"
            class="group sticky top-0 z-30 -mx-4 mt-6 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 lg:hidden"
          >
            <summary
              class="toc-summary flex cursor-pointer select-none items-center justify-between px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              <span class="inline-flex items-center gap-2">
                <UIcon name="i-heroicons-list-bullet" class="h-4 w-4 text-gray-400" />
                Sommaire
              </span>
              <UIcon
                name="i-heroicons-chevron-down"
                class="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180"
              />
            </summary>
            <nav aria-label="Sommaire du dossier">
              <ul
                class="max-h-[60vh] space-y-0.5 overflow-y-auto border-t border-gray-100 px-2 py-2 dark:border-gray-700"
              >
                <li v-for="section in sections" :key="section.id">
                  <a
                    :href="`#${section.id}`"
                    class="block rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    @click="closeMobileToc"
                  >
                    {{ section.label }}
                  </a>
                </li>
              </ul>
            </nav>
          </details>

          <!-- Sections -->
          <!--
            Ordre voulu (mobile-first) : on place EN HAUT les blocs à forte valeur et
            concrets (repères, documents/sources, calendrier, ce qui change) ; l'analyse
            longue vient APRÈS. Le sommaire (computed `sections`) suit le même ordre.
          -->
          <div class="mt-6 space-y-5 sm:mt-10 sm:space-y-10">
            <!-- 1. À retenir : résumé rapide / repères clés, AVANT le contenu détaillé -->
            <DossierSection
              id="a-retenir"
              title="À retenir"
              description="Les informations essentielles du dossier en un coup d'œil"
              :empty="!has(dossier.highlights)"
            >
              <DossierHighlights :items="dossier.highlights!" />
            </DossierSection>

            <!-- 2. Documents liés (sources) -->
            <DossierSection id="documents" title="Documents liés" :empty="!has(dossier.documents)">
              <DossierRelatedDocuments :documents="dossier.documents!" />
            </DossierSection>

            <!-- 3. Chronologie (le calendrier) -->
            <DossierSection id="chronologie" title="Chronologie" :empty="!has(dossier.timeline)">
              <DossierTimeline :items="dossier.timeline!" />
            </DossierSection>

            <!-- 4. Comparatif ancien / nouveau (ce qui change concrètement) -->
            <DossierSection
              id="comparatif"
              title="Comparatif"
              description="Ce qui change par rapport au texte précédent"
              :empty="!has(dossier.comparison)"
            >
              <DossierComparison :rows="dossier.comparison!" />
            </DossierSection>

            <!-- 5. Analyse : introduction éditoriale + contenu riche (texte long, APRÈS l'essentiel) -->
            <DossierSection
              id="introduction"
              title="Analyse"
              :empty="!dossier.intro_html && !dossier.content_html"
            >
              <div
                v-if="dossier.intro_html"
                class="prose prose-base max-w-none text-gray-700 dark:prose-invert prose-headings:font-semibold prose-p:text-[17px] prose-p:leading-[1.65] prose-a:text-sky-600 dark:text-gray-300 dark:prose-a:text-sky-400 sm:prose-p:text-lg"
                v-html="dossier.intro_html"
              />
              <div
                v-if="dossier.content_html"
                class="prose prose-base mt-6 max-w-none text-gray-700 dark:prose-invert prose-headings:font-semibold prose-h2:mt-8 prose-p:text-[17px] prose-p:leading-[1.65] prose-a:text-sky-600 prose-img:rounded-xl dark:text-gray-300 dark:prose-a:text-sky-400 sm:prose-p:text-lg"
                v-html="dossier.content_html"
              />
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

            <!-- Thèmes / tags : en pied d'article (convention éditoriale « sujets liés ») -->
            <div
              v-if="dossierTags.length"
              class="border-t border-gray-100 pt-5 dark:border-gray-700 sm:pt-8"
            >
              <p
                class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500"
              >
                Thèmes
              </p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in dossierTags"
                  :key="tag"
                  class="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

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
/* Masque le marqueur natif (triangle) du <summary> du sommaire mobile. */
.toc-summary::-webkit-details-marker {
  display: none;
}
.toc-summary {
  list-style: none;
}
</style>
