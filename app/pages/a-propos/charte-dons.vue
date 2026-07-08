<script setup lang="ts">
const { siteName, siteUrl, keywords, themeColor } = useSiteMetadata()

const title = 'Charte des Dons - Vie Publique Sénégal'
const description =
  'Découvrez notre charte des dons et comment nous utilisons vos contributions pour maintenir une plateforme d\'information publique transparente au Sénégal. Transparence financière, sécurité des paiements et engagement.'
const url = `${siteUrl}/a-propos/charte-dons`
const image = `${siteUrl}/og-image.png`

// SEO Meta Tags
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: image,
  ogUrl: url,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: image,
  keywords: [
    ...keywords,
    'charte dons vie publique',
    'dons sénégal',
    'transparence financière',
    'soutenir vie publique',
    'bictorys',
    'paydunya',
    'contribution citoyenne',
  ].join(', '),
})

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Charte des Dons',
      item: url,
    },
  ],
}

// Head Configuration
useHead({
  htmlAttrs: { lang: 'fr-SN' },
  link: [{ rel: 'canonical', href: url }],
  meta: [
    { name: 'theme-color', content: themeColor },
    { name: 'author', content: siteName },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { name: 'robots', content: 'index, follow' },
    { name: 'geo.region', content: 'SN' },
    { name: 'geo.placename', content: 'Dakar' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify(breadcrumbSchema),
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-white py-8 pb-16 dark:bg-gray-900">
    <UContainer>
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <AppBreadcrumb
          :items="[
            { label: 'À propos', to: '/a-propos/qui-sommes-nous' },
            { label: 'Charte des dons' },
          ]"
        />

        <!-- En-tête -->
        <div class="mb-8 border-b border-gray-200 pb-6 dark:border-gray-700">
          <h1 class="mb-3 text-4xl font-bold text-gray-900 dark:text-white">Charte des Dons</h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Vie Publique Sénégal - Plateforme citoyenne indépendante
          </p>
          <div class="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Dernière mise à jour : Janvier 2025</span>
            <span>•</span>
            <span>Version 1.0</span>
          </div>
        </div>

        <!-- Contenu de la charte -->
        <article class="prose prose-lg dark:prose-invert max-w-none">
          <h2>Introduction</h2>

          <p>
            Vie Publique Sénégal est une plateforme citoyenne indépendante dédiée à la transparence
            de l'information publique au Sénégal. Vos dons nous aident à maintenir cette mission
            essentielle pour la démocratie sénégalaise.
          </p>

          <h2>1. Utilisation des dons</h2>

          <p>Les fonds collectés via les dons sont exclusivement utilisés pour :</p>

          <ul>
            <li>
              <strong>Hébergement et infrastructure</strong> : Maintien des serveurs et de
              l'infrastructure technique nécessaire au fonctionnement de la plateforme
            </li>
            <li>
              <strong>Développement</strong> : Amélioration continue des fonctionnalités et
              développement de nouveaux services
            </li>
            <li>
              <strong>Collecte de données</strong> : Acquisition et mise à jour des données publiques
            </li>
            <li>
              <strong>Maintenance</strong> : Assurer la disponibilité, la sécurité et la performance
              de la plateforme
            </li>
            <li>
              <strong>Coûts opérationnels</strong> : Frais administratifs et de gestion nécessaires
              au bon fonctionnement
            </li>
          </ul>

          <h2>2. Transparence financière</h2>

          <p>Nous nous engageons à :</p>

          <ul>
            <li>Publier annuellement un rapport détaillé sur l'utilisation des dons</li>
            <li>Maintenir une comptabilité transparente et accessible</li>
            <li>Communiquer régulièrement sur nos projets et dépenses</li>
            <li>Garantir une gestion rigoureuse et éthique des fonds</li>
          </ul>

          <h2>3. Modalités de don</h2>

          <h3>Montants</h3>

          <ul>
            <li>Aucun montant minimum requis</li>
            <li>Les dons peuvent être ponctuels ou récurrents</li>
            <li>Tous les montants sont en Francs CFA (XOF)</li>
          </ul>

          <h3>Méthodes de paiement acceptées</h3>

          <ul>
            <li>
              <strong>Bictorys</strong> : Paiement par carte bancaire, mobile money (Orange Money,
              Wave)
            </li>
            <li>
              <strong>Paydunya</strong> : Paiement par carte bancaire, mobile money (Orange Money,
              Wave)
            </li>
          </ul>

          <h2>4. Sécurité et confidentialité</h2>

          <h3>Protection des données</h3>

          <ul>
            <li>
              Vos informations personnelles sont protégées selon la loi sénégalaise sur les données
              personnelles
            </li>
            <li>
              Nous ne partageons jamais vos données avec des tiers à des fins commerciales
            </li>
            <li>
              Vos informations de paiement sont traitées de manière sécurisée par nos prestataires de
              paiement certifiés
            </li>
          </ul>

          <h3>Traitement des paiements</h3>

          <ul>
            <li>Les paiements sont traités via des plateformes sécurisées (Bictorys et Paydunya)</li>
            <li>Nous ne stockons jamais vos informations bancaires ou de carte de crédit</li>
            <li>Toutes les transactions sont cryptées selon les standards de l'industrie</li>
          </ul>

          <h2>5. Reçus et confirmation</h2>

          <p>Après chaque don, vous recevrez :</p>

          <ul>
            <li>Un email de confirmation immédiat avec les détails de votre transaction</li>
            <li>Un reçu détaillé avec votre référence de paiement unique</li>
            <li>La possibilité de nous contacter pour toute question concernant votre don</li>
          </ul>

          <h2>6. Remboursements et annulations</h2>

          <h3>Politique de remboursement</h3>

          <ul>
            <li>
              Les dons sont généralement non remboursables car ils sont immédiatement alloués à nos
              projets
            </li>
            <li>
              En cas d'erreur de transaction ou de problème technique, contactez-nous à
              <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
            </li>
            <li>Nous étudierons chaque demande au cas par cas avec bienveillance</li>
          </ul>

          <h3>Délai de traitement</h3>

          <ul>
            <li>Les demandes de remboursement sont traitées sous 15 jours ouvrables</li>
            <li>Un justificatif pourra être demandé selon la nature de la demande</li>
          </ul>

          <h2>7. Anonymat et reconnaissance</h2>

          <h3>Dons anonymes</h3>

          <ul>
            <li>Vous pouvez choisir de rester anonyme lors de votre don</li>
            <li>Votre nom ne sera pas publié sans votre consentement explicite</li>
          </ul>

          <h3>Reconnaissance publique</h3>

          <ul>
            <li>Les donateurs peuvent choisir d'être mentionnés dans notre rapport annuel</li>
            <li>
              Une page de remerciements peut être créée pour les contributeurs réguliers (avec leur
              accord)
            </li>
          </ul>

          <h2>8. Responsabilité et engagement</h2>

          <h3>Nos engagements</h3>

          <p>Nous nous engageons à :</p>

          <ul>
            <li>Utiliser les fonds de manière responsable et éthique</li>
            <li>Maintenir la plateforme accessible et gratuite pour tous</li>
            <li>Préserver notre indépendance éditoriale et politique</li>
            <li>Ne jamais compromettre l'intégrité de nos informations</li>
          </ul>

          <h3>Votre responsabilité</h3>

          <p>En effectuant un don, vous :</p>

          <ul>
            <li>Confirmez être majeur(e) et capable légalement de faire un don</li>
            <li>Garantissez que les fonds proviennent de sources légitimes</li>
            <li>Acceptez que le don soit utilisé selon les priorités de Vie Publique Sénégal</li>
          </ul>

          <h2>9. Indépendance et neutralité</h2>

          <h3>Principe d'indépendance</h3>

          <ul>
            <li>
              Vie Publique Sénégal reste totalement indépendant de tout parti politique,
              gouvernement ou organisation
            </li>
            <li>
              Les dons ne donnent aucun droit d'influence sur le contenu ou la ligne éditoriale
            </li>
            <li>Nous refusons tout don conditionné à une quelconque contrepartie éditoriale</li>
          </ul>

          <h3>Conflits d'intérêt</h3>

          <ul>
            <li>
              Nous nous réservons le droit de refuser tout don qui pourrait créer un conflit
              d'intérêt
            </li>
            <li>La transparence et l'objectivité restent nos valeurs fondamentales</li>
          </ul>

          <h2>10. Contact et questions</h2>

          <p>Pour toute question concernant les dons ou cette charte :</p>

          <ul>
            <li>
              <strong>Email</strong> :
              <a href="mailto:contact@vie-publique.sn">contact@vie-publique.sn</a>
            </li>
            <li>
              <strong>Site web</strong> :
              <a href="https://www.vie-publique.sn">https://www.vie-publique.sn</a>
            </li>
            <li>
              <strong>Réseaux sociaux</strong> : Suivez-nous sur
              <a href="https://x.com/ViePubliqueSN" target="_blank">Twitter</a> |
              <a href="https://www.facebook.com/ViePubliqueSenegal" target="_blank">Facebook</a> |
              <a href="https://www.linkedin.com/company/vie-publique-sn" target="_blank">LinkedIn</a>
              |
              <a href="https://www.whatsapp.com/channel/0029VawbhaFLikg1htAGXc2I" target="_blank"
                >WhatsApp</a
              >
            </li>
          </ul>

          <h2>11. Modifications de la charte</h2>

          <p>
            Cette charte peut être modifiée à tout moment pour refléter nos pratiques actuelles.
            Toute modification substantielle sera :
          </p>

          <ul>
            <li>Communiquée par email aux donateurs réguliers</li>
            <li>Publiée sur notre site web avec la date de mise à jour</li>
            <li>Applicable aux nouveaux dons effectués après la modification</li>
          </ul>

          <hr />

          <p><strong>Dernière mise à jour</strong> : Janvier 2025</p>

          <p><strong>Version</strong> : 1.0</p>

          <hr />

          <h2>Merci pour votre soutien !</h2>

          <p>
            Votre contribution, quelle que soit sa taille, fait une réelle différence dans notre
            capacité à maintenir une plateforme d'information publique transparente et accessible à
            tous les Sénégalais.
          </p>

          <p>Ensemble, nous construisons une société plus transparente et mieux informée.</p>

          <p><strong>L'équipe Vie Publique Sénégal</strong></p>

          <div class="mt-8 rounded-lg bg-green-50 p-6 dark:bg-green-900/20">
            <div class="flex items-start gap-4">
              <UIcon name="i-heroicons-heart" class="mt-1 h-8 w-8 text-red-500" />
              <div>
                <h3 class="text-lg font-semibold text-green-900 dark:text-green-100">
                  Prêt à contribuer ?
                </h3>
                <p class="mt-2 text-green-800 dark:text-green-200">
                  Votre soutien nous aide à maintenir cette plateforme accessible et gratuite pour
                  tous.
                </p>
                <div class="mt-4 flex gap-4">
                  <UButton to="/don/bictorys" color="primary" size="lg">
                    Faire un don avec Bictorys
                  </UButton>
                  <UButton to="/don/paydunya" color="primary" variant="outline" size="lg">
                    Faire un don avec Paydunya
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </UContainer>
  </div>
</template>

<style scoped>
/* Style personnalisé pour le contenu markdown en mode dark */
:deep(.prose) {
  @apply text-gray-900 dark:text-gray-100;
}

:deep(.prose h2) {
  @apply mb-4 mt-8 border-b border-gray-200 pb-2 text-gray-900 dark:border-gray-700 dark:text-white;
}

:deep(.prose h3) {
  @apply mb-3 mt-6 text-gray-900 dark:text-white;
}

:deep(.prose p) {
  @apply text-gray-700 dark:text-gray-300;
}

:deep(.prose a) {
  @apply text-primary-600 hover:underline dark:text-primary-400;
}

:deep(.prose ul) {
  @apply text-gray-700 dark:text-gray-300;
}

:deep(.prose li) {
  @apply mb-2;
}

:deep(.prose strong) {
  @apply text-gray-900 dark:text-white;
}

:deep(.prose hr) {
  @apply border-gray-200 dark:border-gray-700;
}
</style>
