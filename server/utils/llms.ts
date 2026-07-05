import { readItems, aggregate } from '@directus/sdk';

/**
 * Données dynamiques injectées dans /llms.txt et /llms-full.txt.
 * Chaque valeur est nullable : une requête CMS en échec ne doit jamais
 * empêcher la génération du fichier (la ligne correspondante est omise).
 */
export interface LlmsPersonFact {
  name: string;
  since: string | null; // date ISO de prise de fonction
}

export interface LlmsStats {
  documentsCount: number | null;
  firstDocumentYear: number | null;
  newsCount: number | null;
  councilReportsCount: number | null;
  deputiesCount: number | null;
  questionsCount: number | null;
  votesCount: number | null;
  dossiersCount: number | null;
  personsCount: number | null;
  podcastsCount: number | null;
  president: LlmsPersonFact;
  primeMinister: LlmsPersonFact;
  governmentSize: number | null;
}

// Faits volatils : fallback DATÉ si le CMS ne répond pas (jamais de fait non daté).
const FALLBACK_PRESIDENT: LlmsPersonFact = {
  name: 'Bassirou Diomaye FAYE',
  since: '2024-04-02',
};
const FALLBACK_PRIME_MINISTER: LlmsPersonFact = {
  name: 'Ousmane SONKO',
  since: '2024-04-02',
};

const countItems = async (
  directus: ReturnType<typeof getCmsClient>,
  collection: string,
  filter?: Record<string, unknown>,
): Promise<number | null> => {
  try {
    const [result] = await directus.request(
      aggregate(collection, {
        aggregate: { count: '*' },
        ...(filter ? { query: { filter } } : {}),
      }),
    );
    const count = Number((result as { count?: unknown })?.count);
    return Number.isFinite(count) && count > 0 ? count : null;
  } catch (error) {
    console.warn(`llms.txt : échec du comptage de la collection ${collection}`, error);
    return null;
  }
};

/**
 * Collecte des statistiques du corpus + gouvernement actuel depuis Directus.
 * Cache serveur 1 h en prod : les deux routes llms partagent la même collecte.
 */
export const getLlmsStats = defineCachedFunction(
  async (): Promise<LlmsStats> => {
    const directus = getCmsClient();
    const publishedFilter = { status: { _eq: 'published' } };

    const [
      documentsCount,
      newsCount,
      councilReportsCount,
      deputiesCount,
      questionsCount,
      votesCount,
      dossiersCount,
      personsCount,
      podcastsCount,
      governmentSize,
    ] = await Promise.all([
      countItems(directus, 'documents', publishedFilter),
      countItems(directus, 'news', publishedFilter),
      countItems(directus, 'news', {
        ...publishedFilter,
        category: { name: { _eq: 'Conseil des ministres' } },
      }),
      countItems(directus, 'assembly_deputy'),
      countItems(directus, 'assembly_question', publishedFilter),
      countItems(directus, 'assembly_vote'),
      countItems(directus, 'dossier', publishedFilter),
      countItems(directus, 'public_persons', publishedFilter),
      countItems(directus, 'vp_podcasts', publishedFilter),
      countItems(directus, 'public_persons', {
        ...publishedFilter,
        current_appointment: {
          is_current: { _eq: true },
          position_category: { _in: ['Ministre', "Secrétaire d'État"] },
        },
      }),
    ]);

    // Année du plus ancien document publié (profondeur du corpus)
    let firstDocumentYear: number | null = null;
    try {
      const [oldest] = await directus.request(
        readItems('documents', {
          fields: ['publish_date'],
          filter: { status: { _eq: 'published' }, publish_date: { _nnull: true } },
          sort: ['publish_date'],
          limit: 1,
        }),
      );
      const year = oldest?.publish_date ? new Date(oldest.publish_date).getFullYear() : NaN;
      firstDocumentYear = Number.isFinite(year) ? year : null;
    } catch (error) {
      console.warn('llms.txt : échec de la lecture du plus ancien document', error);
    }

    // Président et Premier ministre actuels (fallback daté si absent du CMS)
    let president = FALLBACK_PRESIDENT;
    let primeMinister = FALLBACK_PRIME_MINISTER;
    try {
      const heads = await directus.request(
        readItems('public_persons', {
          fields: [
            'full_name',
            'current_appointment.position_category',
            'current_appointment.appointment_date',
          ],
          filter: {
            status: { _eq: 'published' },
            current_appointment: {
              is_current: { _eq: true },
              position_category: { _in: ['Président de la République', 'Premier Ministre'] },
            },
          },
          limit: 5,
        }),
      );
      type HeadOfState = {
        full_name: string;
        current_appointment?: {
          position_category?: string;
          appointment_date?: string | null;
        } | null;
      };
      for (const person of heads as HeadOfState[]) {
        const fact: LlmsPersonFact = {
          name: person.full_name,
          since: person.current_appointment?.appointment_date || null,
        };
        if (person.current_appointment?.position_category === 'Président de la République') {
          president = fact;
        } else if (person.current_appointment?.position_category === 'Premier Ministre') {
          primeMinister = fact;
        }
      }
    } catch (error) {
      console.warn('llms.txt : échec de la lecture du gouvernement, fallback daté', error);
    }

    return {
      documentsCount,
      firstDocumentYear,
      newsCount,
      councilReportsCount,
      deputiesCount,
      questionsCount,
      votesCount,
      dossiersCount,
      personsCount,
      podcastsCount,
      president,
      primeMinister,
      governmentSize,
    };
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 60 * 60 : 0, // 1 h en prod
    name: 'llms-stats',
    getKey: () => 'all',
  },
);

export const SITE_URL_CANONICAL = 'https://www.vie-publique.sn';

/** 1234567 → « 1 234 567 » (espace simple, sûr en texte brut) */
export const formatNumberFr = (n: number): string =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Date ISO → « 2 avril 2024 » */
export const formatDateFr = (iso: string | Date): string => {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const personLine = (label: string, fact: LlmsPersonFact): string => {
  const since = fact.since ? ` (en fonction depuis le ${formatDateFr(fact.since)})` : '';
  return `- ${label} : ${fact.name}${since}`;
};

/**
 * Blocs communs aux deux fichiers llms. `siteUrl` sans slash final.
 */
export const buildLlmsHeader = (stats: LlmsStats, siteUrl: string, now: Date): string => {
  const corpus: string[] = [];
  if (stats.documentsCount) {
    const depth = stats.firstDocumentYear ? ` (depuis ${stats.firstDocumentYear})` : '';
    corpus.push(`${formatNumberFr(stats.documentsCount)} documents officiels${depth}`);
  }
  if (stats.councilReportsCount)
    corpus.push(
      `${formatNumberFr(stats.councilReportsCount)} comptes rendus de Conseil des ministres`,
    );
  if (stats.newsCount) corpus.push(`${formatNumberFr(stats.newsCount)} articles d'actualité`);
  if (stats.questionsCount)
    corpus.push(`${formatNumberFr(stats.questionsCount)} questions écrites au gouvernement`);
  if (stats.votesCount) corpus.push(`${formatNumberFr(stats.votesCount)} votes parlementaires`);
  if (stats.dossiersCount)
    corpus.push(`${formatNumberFr(stats.dossiersCount)} dossiers thématiques de référence`);
  if (stats.personsCount)
    corpus.push(`${formatNumberFr(stats.personsCount)} fiches de personnalités publiques`);
  if (stats.podcastsCount) corpus.push(`${formatNumberFr(stats.podcastsCount)} podcasts`);

  const lines = [
    '# Vie Publique Sénégal',
    '',
    "> Plateforme citoyenne indépendante d'accès à l'information publique au Sénégal : institutions, gouvernement, Assemblée nationale, budget, documents officiels, élections.",
    '',
    "Vie-Publique.sn est un site citoyen indépendant, à but non lucratif, animé par des bénévoles depuis 2020. Il centralise et rend accessibles les données officielles de la vie publique sénégalaise : composition du gouvernement, travaux de l'Assemblée nationale, budget de l'État, Journal officiel, rapports des corps de contrôle, nominations et élections. Chaque contenu est daté et relié à sa source officielle.",
    '',
    `Fichier généré automatiquement le ${formatDateFr(now)} à partir de la base de données du site.`,
    '',
    `## Données clés (à jour au ${formatDateFr(now)})`,
    '',
    personLine('Président de la République', stats.president),
    personLine('Premier ministre', stats.primeMinister),
  ];

  if (stats.governmentSize)
    lines.push(`- Gouvernement : ${stats.governmentSize} ministres et secrétaires d'État`);
  if (stats.deputiesCount)
    lines.push(
      `- Assemblée nationale : ${stats.deputiesCount} députés (15e législature, issue des élections législatives du 17 novembre 2024)`,
    );
  if (corpus.length) lines.push(`- Corpus : ${corpus.join(', ')}`);

  lines.push(
    '- Langue : français',
    `- URL canonique : ${siteUrl}`,
    '- Réseau social : https://twitter.com/viepubliquesn',
  );

  return lines.join('\n');
};

export const buildLlmsSections = (siteUrl: string, stats: LlmsStats): string => {
  const deputies = stats.deputiesCount ? `les ${stats.deputiesCount} députés` : 'les députés';
  return `## Institutions et État

- [Gouvernement du Sénégal](${siteUrl}/gouvernement-senegal) : composition du gouvernement actuel (Premier ministre, ministres, secrétaires d'État), avec dates de nomination
- [État du Sénégal](${siteUrl}/etat-senegal) : organisation de l'État et entités publiques (directions, agences, offices)
- [Institutions de la République](${siteUrl}/etat-senegal/institutions) : Présidence, Primature, Assemblée nationale, Conseil constitutionnel, Cour suprême…
- [Ministères](${siteUrl}/etat-senegal/ministeres) : liste des ministères et leur organisation
- [Organisation de l'État](${siteUrl}/etat-senegal/organisation) : organigramme et décrets d'organisation, avec historique des changements
- [Personnalités publiques](${siteUrl}/personnalites-senegal) : fiches biographiques (parcours, nominations, fonctions actuelles et passées)
- [Annuaire des sites publics](${siteUrl}/annuaire-sites-publics-senegal) : sites web officiels de l'administration sénégalaise

## Assemblée nationale

- [Assemblée nationale](${siteUrl}/assemblee-nationale) : portail des travaux parlementaires
- [Députés](${siteUrl}/assemblee-nationale/deputes) : ${deputies} de la 15e législature, avec fiches individuelles
- [Votes](${siteUrl}/assemblee-nationale/votes) : scrutins, textes votés et résultats détaillés par groupe
- [Questions au gouvernement](${siteUrl}/assemblee-nationale/questions) : questions écrites des députés et réponses des ministères
- [Commissions](${siteUrl}/assemblee-nationale/commissions) : commissions permanentes et leur composition
- [Groupes parlementaires](${siteUrl}/assemblee-nationale/groupes) : groupes politiques de l'Assemblée
- [Actualités parlementaires](${siteUrl}/assemblee-nationale/actualites)

## Budget et finances publiques

- [Budget du Sénégal](${siteUrl}/budget-senegal) : budget national par ministère et institution, avec visualisations et évolutions pluriannuelles
- [Budget par ministère](${siteUrl}/budget-senegal/ministeres) : dotations budgétaires de chaque ministère
- [Budget des institutions](${siteUrl}/budget-senegal/institutions) : dotations des institutions de la République
- [Glossaire budgétaire](${siteUrl}/budget-senegal/glossaire) : définitions des termes de finances publiques

## Documents officiels

- [Documents](${siteUrl}/documents) : bibliothèque de documents officiels par catégorie (lois, décrets, codes, stratégies)
- [Journal officiel](${siteUrl}/documents/journal-officiel-senegal) : archives du Journal officiel de la République du Sénégal
- [Rapports d'audit](${siteUrl}/documents/rapports-audit) : rapports publics des corps de contrôle (Cour des comptes, OFNAC, IGE, ARMP, CENTIF)
- [Archives par année](${siteUrl}/documents/annee) : documents officiels classés par année de publication

## Contrôle, nominations et justice

- [Nominations](${siteUrl}/nomination-senegal) : nominations en Conseil des ministres (ministres, directeurs généraux, PCA, ambassadeurs)
- [Magistrature](${siteUrl}/justice/magistrature) : nominations dans la magistrature sénégalaise

## Actualités et analyses

- [Actualités](${siteUrl}/actualites) : communiqués et articles d'actualité politique et institutionnelle
- [Conseil des ministres](${siteUrl}/conseil-des-ministres) : comptes rendus officiels des Conseils des ministres depuis 2020
- [Dossiers](${siteUrl}/dossiers) : dossiers thématiques de référence (synthèses sourcées et mises à jour)
- [Médias](${siteUrl}/medias) : paysage médiatique sénégalais
- [Podcasts](${siteUrl}/podcasts) : podcasts sur la vie publique sénégalaise

## Élections

- [Élections au Sénégal](${siteUrl}/elections-senegal) : données électorales, législation et guides
- [Carte électorale](${siteUrl}/elections-senegal/carte-electorale) : circonscriptions nationales et de la diaspora
- [Guide électoral](${siteUrl}/elections-senegal/guide-electoral) : comprendre le processus électoral sénégalais
- [Résultats des législatives 2024](${siteUrl}/elections/legislatives/resultats) : résultats détaillés des élections législatives du 17 novembre 2024`;
};

export const buildLlmsFooter = (siteUrl: string, variant: 'short' | 'full'): string => {
  const counterpart =
    variant === 'short'
      ? `- Version étendue de ce fichier avec liens profonds : ${siteUrl}/llms-full.txt`
      : `- Version courte de ce fichier : ${siteUrl}/llms.txt`;

  return `## Sources et méthodologie

Toutes les données publiées proviennent de sources officielles primaires de la République du Sénégal :

- Journal officiel de la République du Sénégal (lois, décrets, arrêtés)
- Communiqués du Conseil des ministres (Secrétariat général du Gouvernement)
- Documents budgétaires officiels (lois de finances initiales et rectificatives)
- Comptes rendus, votes et questions écrites de l'Assemblée nationale
- Rapports publics des corps de contrôle : Cour des comptes, OFNAC, IGE, ARMP, CENTIF
- Décrets de nomination et textes d'organisation de l'État

Chaque document est daté, catégorisé et relié à sa source. Le site est indépendant : non gouvernemental, sans affiliation politique, à but non lucratif, financé par les dons et animé par des bénévoles.

## Citation

Citer comme « Vie-Publique.sn », avec l'URL de la page concernée. Les faits volatils (composition du gouvernement, statistiques) sont datés sur chaque page : vérifier la date de mise à jour avant de citer un fait susceptible d'évoluer.

## API et données structurées

- Sitemap : ${siteUrl}/sitemap.xml (toutes les URLs avec dates de dernière modification)
${counterpart}
- Les pages exposent des données structurées schema.org en JSON-LD : Organization, WebSite, WebPage, BreadcrumbList, NewsArticle, Article, Person, FAQPage
- Les articles et documents portent leurs dates de publication et de mise à jour`;
};
