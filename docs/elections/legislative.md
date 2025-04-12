# schéma de base de données

- La table circonscriptions stocke les 45 départements et 8 circonscriptions de la diaspora.
- La table partis contient les informations sur les partis ou coalitions.
- La table listes relie les partis aux circonscriptions, permettant de gérer à la fois les listes départementales et nationales.
- La table candidats stocke toutes les informations sur les candidats, y compris les données supplémentaires que vous souhaitez gérer.
- Les tables resultats_circonscriptions et resultats_nationaux permettront d'enregistrer les résultats des élections.
- La table deputes_elus servira à lister les députés effectivement élus après le scrutin.

Cette structure permet de :

- Gérer les 45 listes départementales et la liste nationale.
- Distinguer les titulaires et les suppléants.
- Stocker les informations supplémentaires sur les candidats.
- Enregistrer les résultats et déterminer les élus.

Pour exposer ces données via une API, vous pourrez créer des endpoints qui interrogent cette base de données. Par exemple :

GET /api/constituencies
GET /api/parties
GET /api/electoral-lists/{constituency_id}
GET /api/candidates/{list_id}
GET /api/constituency-results/{constituency_id}
GET /api/national-results
GET /api/elected-deputies

Additional endpoints could include:

GET /api/candidates/{candidate_id}
POST /api/constituency-results
POST /api/national-results
GET /api/electoral-lists/national
GET /api/electoral-lists/departmental

# V2

Fonctionnement global et la structure finale de la base de données

Résumé du fonctionnement global :

1. Gestion de multiples élections : Le système peut gérer plusieurs élections (législatives, présidentielles, etc.) sur différentes années.

2. Partis et coalitions : Les partis et coalitions sont enregistrés indépendamment des élections, mais liés à des élections spécifiques via une table de jonction.

3. Candidats et personnes : Les informations personnelles des candidats sont séparées de leurs candidatures spécifiques, permettant de suivre un individu à travers plusieurs élections.

4. Listes électorales : Chaque parti/coalition peut avoir des listes nationales (proportionnelles) et départementales pour chaque élection.

5. Députés élus : Le système permet de suivre les mandats des députés élus, y compris ceux réélus sur plusieurs législatures.

6. Affichage des données : L'interface utilisateur affiche d'abord un aperçu des listes, puis les détails des candidats par liste, séparés entre liste nationale et listes départementales.

Structure finale de la base de données :

```

Cette structure de base de données permet de :

1. Gérer plusieurs types d'élections sur différentes années.
2. Suivre les partis/coalitions et leur participation à différentes élections.
3. Enregistrer les informations personnelles des candidats séparément de leurs candidatures.
4. Gérer les listes nationales et départementales pour chaque parti/coalition dans chaque élection.
5. Suivre les mandats des députés élus, y compris les réélections.
6. Optimiser les requêtes grâce aux index sur les clés étrangères fréquemment utilisées.

Pour l'affichage des données, vous pouvez utiliser les requêtes API REST suivantes :

1. Liste des partis/coalitions pour une élection spécifique :
```

GET /items/election_parties?filter[election][id][_eq]=ELECTION_ID&fields=party.id,party.name,party.acronym,party.logo_url,list_order,candidacies.person.first_name,candidacies.person.last_name,candidacies.person.photo_url&filter[candidacies][list_position][_eq]=1

```

2. Détails des candidats pour un parti/coalition spécifique dans une élection :
```

GET /items/election_parties?filter[election][id][_eq]=ELECTION_ID&filter[party][id][_eq]=PARTY_ID&fields=party.name,candidacies.person.first_name,candidacies.person.last_name,candidacies.person.photo_url,candidacies.list_position,candidacies.type,candidacies.constituency.name,candidacies.constituency.type&deep[_sort]=candidacies.constituency.name,candidacies.list_position

```

Cette structure et ces requêtes vous permettront de gérer efficacement votre système d'élections, en couvrant tous les cas de figure que nous avons discutés, tout en optimisant les performances et la flexibilité pour l'affichage des données.
```
