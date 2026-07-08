# llms.txt — fichiers d'orientation pour les crawlers IA (GEO)

> Spec : [llmstxt.org](https://llmstxt.org). Objectif : être cité comme source fiable par les
> assistants IA (ChatGPT, Claude, Perplexity…) sur la vie publique sénégalaise.

## Architecture

| Fichier | Rôle |
| --- | --- |
| `server/routes/llms.txt.get.ts` | `/llms.txt` — version courte (rubriques + données clés) |
| `server/routes/llms-full.txt.get.ts` | `/llms-full.txt` — version étendue (liens profonds : dossiers, organismes d'audit, archives par année) |
| `server/utils/llms.ts` | Collecte des stats Directus + construction du markdown commun aux deux routes |

Tout est **généré dynamiquement** depuis Directus : compteurs du corpus (documents, députés,
votes, questions, dossiers…), Président/PM actuels (`public_persons`, `current_appointment`),
date de génération. **Chaque requête CMS est isolée** : en cas d'échec, la ligne est omise
(compteurs) ou retombe sur un **fallback daté** (Président/PM) — le fichier se génère toujours.

## Règles (à respecter)

1. **Ne JAMAIS recréer `public/llms.txt`** : les assets statiques sont servis avant les routes
   Nitro → il masquerait silencieusement la version dynamique (c'est pourquoi il a été supprimé).
2. **Faits volatils toujours datés.** Les fallbacks `FALLBACK_PRESIDENT` / `FALLBACK_PRIME_MINISTER`
   dans `server/utils/llms.ts` doivent être mis à jour à chaque changement de tête de l'exécutif
   (le CMS prime, le fallback ne sert qu'en cas de panne).
3. **Cohérence robots.txt** : ne pas lister une rubrique en `Disallow` (baromètre, quiz,
   projets-publics, dashboards…). Vérifier `nuxt.config.ts` → `robots` avant d'ajouter un lien.
4. **Nouvelle rubrique majeure du site** = ajouter le lien dans `buildLlmsSections()`
   (et les liens profonds dans `llms-full.txt.get.ts` si pertinent).

## Cache (2 niveaux)

- Stats CMS : `defineCachedFunction` name `llms-stats`, **1 h** en prod.
- Routes : `defineCachedEventHandler` names `llms-txt` / `llms-full-txt`, **24 h** en prod.
- En dev, le cache SWR persiste dans `.nuxt/cache/nitro/` **entre redémarrages** → pour tester
  une valeur fraîche : supprimer `.nuxt/cache/nitro/functions/llms-stats` et
  `.nuxt/cache/nitro/handlers/llms-*`. En prod, résultat vide/périmé → bumper le `name`.

## Vérification

```bash
curl -s https://www.vie-publique.sn/llms.txt | head -30       # « Fichier généré automatiquement le … » + compteurs présents
curl -s https://www.vie-publique.sn/llms-full.txt | grep -c dossiers/   # ≥ nb de dossiers publiés
```

Si les compteurs manquent tous : requêtes CMS en échec (token, réseau) — voir les warns
`llms.txt : échec…` dans les logs serveur.
