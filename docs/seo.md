## Route URL

Plus l’URL est courte, lisible, ciblée, mieux c’est.

Avoir une balise canonical pour éviter le contenu dupliqué si plusieurs slugs pointent vers le même ID.

veillez à ce que vos slugs soient descriptifs et contiennent les mots-clés pertinents.

✅ Structure nom-route/slug (sans ID)

Exemple : /actualites/lancement-initiative-jeunesse
C’est meilleur pour le SEO et pour l’expérience utilisateur.
URL plus lisible, plus propre
Meilleure CTR (taux de clic) dans les résultats Google
Google accorde plus de poids aux mots-clés présents dans l'URL
Plus facile à copier, partager, mémoriser

❌ Mais tu dois faire la recherche par slug côté back/API (moins direct)

⚠️ Structure nom-route/id/slug

Exemple : /actualites/123/lancement-initiative-jeunesse
C’est fonctionnel mais moins optimal pour le SEO.

Plus rapide pour les requêtes (tu as directement l’ID pour l’API)

L’ID n’a aucune valeur SEO

L’URL est moins propre → perçue comme “technique”

Si l’utilisateur supprime le slug et garde juste /123, tu affiches quoi ?

Il faut rediriger proprement si le slug change

- Recommandation pour Vie-publique.sn :
  Utilise l’URL sans l’ID côté public :

- Côté technique :

Quand tu publies une actu, tu stockes aussi le slug en base, et tu peux faire la requête via /api/actualites?slug=lancement-initiative-jeunesse

Tu peux aussi indexer le slug en base pour qu’il soit rapide à chercher

https://chatgpt.com/c/68072289-3828-800c-8bc2-24058d949c4d

https://claude.ai/chat/6b4fb5ce-8e2b-40f6-8860-d6456e2759d6
