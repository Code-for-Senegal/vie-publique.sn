<script setup lang="ts">
import { AUDIT_INSTITUTION_PAGES, getAuditInstitutionPage } from '~~/types/document';
import armpLogo from '~/assets/logos/armp.webp';
import ofnacLogo from '~/assets/logos/ofnac.webp';
import igeLogo from '~/assets/logos/ige.webp';
import courDesComptesLogo from '~/assets/logos/cour_des_comptes.webp';
import centifLogo from '~/assets/logos/centif.webp';
import docLogo from '~/assets/logos/doc.svg';

// --- Route & config organisme ---

const route = useRoute();
const slug = route.params.slug as string;

const orga = getAuditInstitutionPage(slug);
if (!orga) {
  throw createError({ statusCode: 404, message: 'Organisme non trouvé' });
}

const siteUrl = useRuntimeConfig().public.siteUrl || 'https://www.vie-publique.sn';
const pageUrl = `${siteUrl}/documents/rapports-audit/organisme/${orga.slug}`;

// Autres organismes (maillage interne)
const otherOrganismes = AUDIT_INSTITUTION_PAGES.filter((o) => o.slug !== orga.slug);

// --- Logos ---

const logoMap: Record<string, string> = {
  ARMP: armpLogo,
  OFNAC: ofnacLogo,
  IGE: igeLogo,
  'Cour des Comptes': courDesComptesLogo,
  CENTIF: centifLogo,
};
const getLogo = (institution: string) => logoMap[institution] || docLogo;

// --- Documents (filtrés par organisme dès le SSR) ---

const {
  documents,
  loading,
  error,
  currentPage,
  totalItems,
  totalPages,
  itemsPerPage,
  setCurrentPage,
} = useDocuments({
  type: 'audit_report',
  auditInstitution: orga.institution,
  limit: 10,
});

const currentPageUI = computed({
  get: () => currentPage.value,
  set: (value) => setCurrentPage(value),
});

// --- Schema.org (JSON-LD brut : CollectionPage + ItemList) ---

const collectionSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: orga.seoTitle,
  description: orga.description,
  url: pageUrl,
  about: {
    '@type': 'GovernmentOrganization',
    name: orga.fullName,
    alternateName: orga.name,
  },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: documents.value.length,
    itemListElement: documents.value.map((doc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${siteUrl}/documents/${doc.id}/${doc.slug}`,
      name: doc.title,
    })),
  },
}));

// --- SEO (en dernier : voir règle anti-TDZ du projet) ---

useSeoMeta({
  title: orga.seoTitle,
  description: orga.description,
  ogTitle: orga.seoTitle,
  ogDescription: orga.description,
  ogImage: `${siteUrl}/images/share-linkedin.png`,
  ogUrl: pageUrl,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: orga.seoTitle,
  twitterDescription: orga.description,
});

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
  script: [
    {
      key: 'ld-collection-organisme',
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify(collectionSchema.value)),
    },
  ],
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <div class="container mx-auto px-4">
      <AppBreadcrumb
        :items="[
          { label: 'Documents', to: '/documents' },
          { label: 'Rapports publics', to: '/documents/rapports-audit' },
          { label: orga.name },
        ]"
      />
    </div>

    <!-- En-tête éditorial -->
    <header class="container mx-auto px-4">
      <div class="mx-auto max-w-3xl py-6">
        <div class="flex items-center gap-4">
          <img
            :src="getLogo(orga.institution)"
            :alt="`Logo ${orga.fullName}`"
            class="h-14 w-14 shrink-0 rounded-lg object-contain"
          />
          <div>
            <h1 class="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
              {{ orga.seoTitle }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ orga.fullName }}
            </p>
          </div>
        </div>

        <p class="mt-4 text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
          {{ orga.intro }}
        </p>

        <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {{ totalItems }} rapport{{ totalItems > 1 ? 's' : '' }} publié{{
            totalItems > 1 ? 's' : ''
          }}
        </p>
      </div>
    </header>

    <!-- Liste des rapports -->
    <main class="container mx-auto px-4 py-2">
      <div class="mx-auto max-w-3xl">
        <DocumentsDocumentListSkeleton v-if="loading" thumbnail-shape="square" />

        <DocumentsDocumentErrorState
          v-else-if="error"
          :message="`Impossible de charger les rapports de ${orga.name}`"
        />

        <DocumentsDocumentEmptyState
          v-else-if="documents.length === 0"
          icon="i-heroicons-document-chart-bar"
          :message="`Aucun rapport de ${orga.name} pour le moment`"
        />

        <div v-else class="space-y-3">
          <DocumentsDocumentListItem
            v-for="doc in documents"
            :key="doc.id"
            :document="doc"
            thumbnail-mode="logo"
            :get-logo="getLogo"
            fallback-icon="i-heroicons-document-chart-bar"
            :show-description="false"
            :show-date="false"
            :show-file-indicator="false"
            :show-audit-institution="false"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-6 flex justify-center">
          <UPagination
            v-model="currentPageUI"
            :total="totalItems"
            :page-count="itemsPerPage"
            size="sm"
            :ui="{
              wrapper: 'flex items-center gap-1',
              base: 'min-w-[32px] h-8 flex items-center justify-center rounded-full text-sm',
              rounded: 'rounded-full',
            }"
          />
        </div>

        <!-- Maillage interne : autres organismes de contrôle -->
        <nav
          class="mt-10 border-t border-gray-100 pt-6 dark:border-gray-800"
          aria-label="Autres organismes de contrôle"
        >
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white">
            Rapports d'autres organismes de contrôle
          </h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <NuxtLink
              v-for="other in otherOrganismes"
              :key="other.slug"
              :to="`/documents/rapports-audit/organisme/${other.slug}`"
              class="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {{ other.name }}
            </NuxtLink>
            <NuxtLink
              to="/documents/rapports-audit"
              class="bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Tous les rapports publics
            </NuxtLink>
          </div>
        </nav>
      </div>
    </main>
  </div>
</template>
