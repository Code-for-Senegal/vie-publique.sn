# Flux RSS — architecture et conventions

> Mis en place en juillet 2026 (roadmap « Syndication & contribution »).
> Public cible : journalistes, juristes, ONG, outils de veille, agrégateurs, bots
> (newsletters automatisées, Telegram/WhatsApp) — pas le grand public.

## Les flux exposés

| Flux                  | URL                                            | Source                                          | Tri / date des items          |
| --------------------- | ---------------------------------------------- | ----------------------------------------------- | ----------------------------- |
| Global (30 items)     | `/rss.xml`                                     | news (15) + documents (15) + dossiers (5)       | mixte, anté-chronologique     |
| Actualités            | `/actualites/rss.xml`                          | `news` toutes catégories (30) + dossiers (5)    | `date_published`              |
| Conseil des ministres | `/conseil-des-ministres/rss.xml`               | `news` catégorie « Conseil des ministres » (20) | `date_published`              |
| Documents officiels   | `/documents/rss.xml`                           | `documents` tous types (30)                     | **`date_created`** (voir §)   |
| Journal officiel      | `/documents/journal-officiel-senegal/rss.xml`  | `documents` type `official_journal` (30)        | **`date_created`** (voir §)   |

Les **dossiers** n'ont pas de flux dédié (fréquence de publication trop faible) : ils sont
inclus dans le flux global ET dans le flux actualités (décision produit, juillet 2026).

## Architecture

- **`server/utils/rss.ts`** — builder RSS 2.0 fait main (zéro dépendance, cohérent avec
  `llms.txt`) : `buildRssFeed()`, `sortRssItemsDesc()`, les 3 fetchers
  (`fetchNewsRssItems`, `fetchDocumentRssItems`, `fetchDossierRssItems`),
  `getRssSiteUrl()`, `setRssResponseHeaders()`.
- **`server/routes/**/rss.xml.get.ts`** — 5 routes Nitro dynamiques
  (`defineCachedEventHandler`, cache **30 min en prod / 0 en dev**, SWR).
- **`shared/clean-text.ts`** — `cleanCmsText` / `truncateText`, extraits de
  `app/composables/useCleanText.ts` (qui ré-exporte) pour être utilisables côté serveur.
  Toute description d'item passe par ce nettoyage (strip HTML + entités + NFKC) puis
  troncature à 300 caractères **au code point** — mêmes exigences que les meta SEO
  (cf. CLAUDE.md, règle SEO §11 : pseudo-gras Unicode, surrogates).

## Choix de design (à connaître avant de modifier)

1. **Documents datés par `date_created` (ajout au site), PAS `publish_date` (date
   officielle du texte).** Le site fait du backfill : un Journal officiel de 2019 importé
   aujourd'hui doit apparaître comme *nouveau* dans le flux. Avec `publish_date`, il
   serait invisible des lecteurs RSS (enterré dans l'historique) — ou inversement, un
   import massif rétroactif n'inonderait pas le flux. La date officielle reste visible
   dans le titre du document lui-même.
2. **URLs des actualités par catégorie.** Un item `news` pointe vers sa rubrique :
   catégorie `conseil-des-ministres` → `/conseil-des-ministres/{id}/{slug}`,
   `assemblee-nationale` → `/assemblee-nationale/actualites/{id}/{slug}`, sinon
   `/actualites/{id}/{slug}`. Logique répliquée de `getArticleUrl`
   (`app/pages/actualites/index.vue`) — si elle évolue là-bas, répercuter dans
   `newsArticleUrl` (`server/utils/rss.ts`).
3. **Dégradation propre / anti-cache-poisoning.** Une route qui échoue **throw**
   (Nitro ne met pas en cache les erreurs) plutôt que de retourner un flux vide en 200
   qui serait resservi 30 min. Sur les flux multi-sources : la source *principale* en
   échec → throw ; une source *d'appoint* (dossiers) en échec → omise. Sur le flux
   global : throw uniquement si TOUTES les sources échouent.
4. **XML déterministe.** `lastBuildDate` = date du dernier item (pas `new Date()`) :
   le XML ne change que si le contenu change. `guid` = URL canonique
   (`isPermaLink="true"`). `atom:link rel="self"` présent (requis par le validateur W3C).
5. **En-têtes** : `Content-Type: application/rss+xml; charset=utf-8` +
   `X-Robots-Tag: noindex` (les flux restent crawlables pour l'autodiscovery mais
   n'apparaissent pas dans les résultats de recherche). Pas de `Disallow` robots.txt,
   pas d'entrée sitemap.
6. **Échappement strict** : tout texte passe par `escapeXml` — jamais d'interpolation
   brute dans le XML (titres avec `&`, guillemets, etc.).

## Autodiscovery

- Flux global : `<link rel="alternate" type="application/rss+xml">` déclaré
  **globalement** dans `nuxt.config.ts` (`app.head.link`).
- Flux de rubrique : déclarés par leur page de listing (`useHead({ link: [...] })`) :
  `actualites/index.vue`, `conseil-des-ministres/index.vue`, `documents/index.vue`,
  `documents/[category]/index.vue` (Journal officiel uniquement).
- Les flux sont aussi listés dans `llms.txt` (section « Données structurées et accès
  machine », `server/utils/llms.ts`) et dans le footer.

## Ajouter un flux (ex. rapports d'audit)

1. Créer `server/routes/documents/rapports-audit/rss.xml.get.ts` sur le modèle du flux
   JO : `fetchDocumentRssItems(siteUrl, { type: 'audit_report', limit: 30 })`
   (types valides : voir `shared/document-type-labels.mjs` et le `CATEGORY_CONFIG` de
   `app/pages/documents/[category]/index.vue` pour le slug d'URL).
2. Ajouter l'autodiscovery dans la condition de `documents/[category]/index.vue`.
3. L'ajouter au tableau ci-dessus, à `llms.ts` et vérifier (section suivante).

⚠️ **Ne JAMAIS créer `public/rss.xml`** : comme pour `llms.txt`, un asset statique
masquerait silencieusement la route dynamique.

## Vérification

```bash
# Les 5 flux répondent en XML valide (200, content-type rss+xml)
for f in rss.xml actualites/rss.xml conseil-des-ministres/rss.xml \
         documents/rss.xml documents/journal-officiel-senegal/rss.xml; do
  curl -s -o /dev/null -w "%{http_code} %{content_type} /$f\n" "http://localhost:3000/$f"
done

# Structure : 1 channel, N items, guid = liens détail valides
curl -s http://localhost:3000/rss.xml | grep -c "<item>"

# Échappement : aucun & nu (hors entités), aucun < résiduel dans les descriptions
curl -s http://localhost:3000/actualites/rss.xml | grep -oE '&[a-z]*[^a-z;]' | sort -u

# Validation officielle (prod) : https://validator.w3.org/feed/
#   → soumettre https://www.vie-publique.sn/rss.xml (et les 4 autres)
```

⚠️ Rappels dev local (cf. CLAUDE.md) : le cache Nitro persiste dans `.nuxt/cache/nitro/`
entre les redémarrages (supprimer `handlers/rss-*` pour tester une valeur fraîche — noms :
`rss-global`, `rss-actualites`, `rss-conseil-ministres`, `rss-documents`,
`rss-documents-jo`) ; et tester les accents via un client UTF-8, pas curl Git Bash.

## Diffusion & acquisition — reste à faire (checklist, juillet 2026)

> Déployé en prod le 2026-07-13, les 5 flux validés (200, XML bien formé, dates RFC,
> échappement OK, Googlebot 200, non bloqué par robots.txt). Le flux seul ne génère pas
> de trafic : il faut le brancher. Par ordre d'impact :

### 1. Moteurs de recherche — soumettre le flux comme sitemap

- [ ] **Google Search Console** : Sitemaps → ajouter `https://www.vie-publique.sn/rss.xml`
      (EN PLUS du sitemap.xml, pas à la place). Accélère la découverte des nouveaux
      contenus (recommandation officielle Google : sitemap XML pour l'historique + RSS
      pour la fraîcheur).
      **⚠️ Premier envoi le 2026-07-13 : GSC affiche « Impossible de récupérer le
      sitemap » (type Inconnu, 0 URL). Vérifié le même jour : PAS un vrai problème**
      (curl UA Googlebot → 200 `application/rss+xml`, robots.txt ne bloque pas,
      `X-Robots-Tag: noindex` est normal et recommandé pour un flux). C'est le bug
      d'affichage GSC bien connu au premier envoi d'un sitemap → **attendre 24-72 h,
      puis supprimer/re-soumettre si l'état ne passe pas à « Opération effectuée »**.
      Ne PAS « corriger » le code sur la base de ce message.
- [ ] **Bing Webmaster Tools** : soumettre le même flux comme sitemap (d'autant plus
      utile que l'indexation Bing a posé problème — cf. audit BING-1).

### 2. Automatisation de diffusion (le vrai levier — n8n déjà en prod)

- [ ] Workflow n8n **auto-post réseaux sociaux** : node *RSS Feed Trigger* sur
      `/conseil-des-ministres/rss.xml` et `/documents/journal-officiel-senegal/rss.xml`
      → post X/LinkedIn/Facebook (titre + lien) à chaque nouvel item.
- [ ] **Canal WhatsApp** (et/ou Telegram) « Vie-Publique.sn » alimenté par le flux CM/JO —
      canal n°1 de l'audience sénégalaise, meilleur potentiel de trafic récurrent.
- [ ] **Newsletter RSS-to-email** (Brevo/Mailchimp) : digest hebdo auto-généré depuis
      `/rss.xml`.

### 3. Annuaires / agrégateurs (secondaire)

- [ ] Revendiquer la source sur **Feedly** (feedly.com/i/publisher — logo + description) ;
      rien d'autre à faire, l'autodiscovery suffit.
- [ ] Soumettre à **Feedspot** (listes « Top Senegal News RSS Feeds » → backlink).
- [ ] Optionnel : magazine **Flipboard** alimenté par le flux (audience diaspora).

### 4. Le faire savoir (presse, juristes, veille)

- [ ] **Actualité d'annonce** sur le site : « Suivez le Journal officiel et le Conseil des
      ministres par RSS » (les 5 URLs + mini-guide Feedly). Bon contenu SEO
      (« journal officiel sénégal alerte »).
- [ ] Mentionner les flux sur la page **aide-presse** et dans la prochaine newsletter.

### 5. Mesure (avant d'investir plus)

- [ ] Suivre les user-agents des lecteurs RSS dans les logs serveur (Feedly y indique le
      nombre d'abonnés : `Feedly/1.0 (... N subscribers)`).
- [ ] Optionnel : ajouter `?utm_source=rss&utm_medium=feed` aux liens des items
      (modif dans `server/utils/rss.ts`) pour voir le trafic entrant dans GA4.
      Attention : changer les URLs change les `<guid>` → les lecteurs re-verraient les
      items comme nouveaux une fois. À faire tôt ou jamais.
