<script setup lang="ts">
const { siteName, siteUrl, themeColor } = useSiteMetadata();

const title = 'Gouvernance | Vie Publique Sénégal';
const description =
  "La gouvernance de Vie Publique Sénégal repose sur des règles associatives claires, une séparation des rôles et des principes de transparence et d'indépendance.";
const url = `${siteUrl}/a-propos/gouvernance`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: url,
  twitterCard: 'summary',
});

useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'robots', content: 'index, follow' },
  ],
});

const { documents, loading } = useVpDocuments();

// Fonction pour obtenir l'URL de l'asset via le proxy
const getAssetUrl = (assetId: string, slug: string) => {
  return useCmsFile(`${assetId}/${slug}.pdf`);
};
</script>

<template>
  <div class="container mx-auto min-h-screen max-w-4xl px-4 py-8 pb-16">
    <AppBreadcrumb
      :items="[
        { label: 'À propos', to: '/a-propos/qui-sommes-nous' },
        { label: 'Gouvernance' },
      ]"
    />

    <article class="prose prose-sm mx-auto sm:prose lg:prose-lg dark:prose-invert">
      <h1>Gouvernance</h1>

      <p class="text-sm text-gray-600 dark:text-gray-400">Dernière mise à jour : décembre 2025</p>

      <h2>Principes généraux</h2>
      <p>
        Vie Publique Sénégal est une association citoyenne indépendante, régie par des statuts et un
        règlement intérieur. Elle est à but non lucratif et ne poursuit aucun objectif partisan,
        politique ou commercial.
      </p>

      <p>
        La gouvernance repose sur des principes de transparence, de responsabilité collective,
        d’indépendance éditoriale et de séparation entre les fonctions décisionnelles et
        opérationnelles.
      </p>

      <h2>Organes de gouvernance</h2>

      <h3>Assemblée Générale (AG)</h3>
      <p>
        L’Assemblée Générale est l’organe souverain de l’association. Elle réunit les membres et se
        prononce notamment sur :
      </p>
      <ul>
        <li>les orientations générales de l’association</li>
        <li>l’adoption des rapports moraux et financiers</li>
        <li>les modifications statutaires</li>
        <li>l’élection des membres du Conseil d’Administration</li>
      </ul>

      <h3>Conseil d’Administration (CA)</h3>
      <p>
        Le Conseil d’Administration assure la direction stratégique de l’association. Il veille à la
        bonne mise en œuvre des décisions de l’Assemblée Générale et au respect des valeurs de Vie
        Publique Sénégal.
      </p>

      <p>Les membres du Conseil d’Administration exercent leurs fonctions à titre bénévole.</p>

      <h3>Bureau Exécutif</h3>
      <p>
        Le Bureau Exécutif est chargé de la gestion courante de l’association et de l’exécution des
        décisions du Conseil d’Administration.
      </p>

      <h2>Équipe opérationnelle</h2>
      <p>
        Les activités quotidiennes de Vie Publique Sénégal sont assurées par une équipe
        opérationnelle (bénévoles, prestataires ou salariés selon les projets), distincte des
        organes de gouvernance.
      </p>

      <p>
        Les choix éditoriaux et opérationnels relèvent de cette équipe, dans le respect des
        orientations définies par les organes associatifs.
      </p>

      <h2>Indépendance et prévention des conflits d’intérêts</h2>
      <p>
        Vie Publique Sénégal applique des règles internes visant à prévenir les conflits d’intérêts
        et à garantir l’indépendance de ses travaux.
      </p>

      <p>
        Aucun partenaire financier ne siège dans les organes de gouvernance et ne dispose d’un
        pouvoir décisionnel sur les orientations éditoriales ou stratégiques de l’association.
      </p>

      <h2>Textes de référence</h2>

      <div v-if="loading" class="space-y-4 py-4">
        <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
        <div class="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      <ul v-else-if="documents && documents.length">
        <li v-for="doc in documents" :key="doc.id">
          <a
            :href="getAssetUrl(doc.file, doc.slug)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 hover:underline"
          >
            {{ doc.title }}
          </a>
        </li>
      </ul>

      <p v-else class="italic text-gray-500">Aucun document disponible pour le moment.</p>

      <p>Ces documents encadrent le fonctionnement interne de l’association.</p>

      <hr />

      <p class="text-sm text-gray-600 dark:text-gray-400">
        Pour toute question relative à la gouvernance :
        <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
      </p>
    </article>
  </div>
</template>
