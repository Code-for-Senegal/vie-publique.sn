# 🗳️ Elections – Modèles

## 🎯 Objectifs

* Publier les **données électorales** pour tous types d'élections (Présidentielles, Législatives, Locales)
* Gérer les **coalitions, listes électorales et candidats** avec leurs profils détaillés
* Afficher les **résultats** par département, commune et bureau de vote
* Gérer la **cartographie électorale** (nationale et diaspora)
* Fournir les **statistiques** (participation, répartition par sexe, âge, profession)
* Intégrer les **guides électoraux** (vidéos YouTube) et la **législation** (documents PDF)
* Permettre la **liaison entre élections** (1er tour ↔ 2nd tour, etc.)
* Préparer un modèle stable pour le dashboard électoral de Vie-publique.sn

---

## 🧱 Modèle de données

### 1️⃣ `elections` — *Élections principales*

Table pivot regroupant toutes les élections organisées au Sénégal.

| Champ                | Type                                       | Description                                | Exemple                    |
| -------------------- | ------------------------------------------ | ------------------------------------------ | -------------------------- |
| id                   | int                                        | ID interne                                 | 1                          |
| status               | string (`scheduled`, `registration`, `campaign`, `ongoing`, `completed`)  | État de l'élection                        | "completed"                |
| sort                 | int                                        | Ordre d'affichage                          | 1                          |
| name                 | string                                     | Nom de l'élection (unique)                 | "Législatives 2024"        |
| year                 | int                                        | Année de l'élection                        | 2024                       |
| type                 | enum (`legislative`, `presidential`, `locale`) | Type d'élection                        | "legislative"              |
| participation_rate   | float                                      | Taux de participation (%)                  | 49.51                      |
| rounds               | int (défaut: 1)                            | Nombre de tours                            | 1                          |
| election_date        | date                                       | Date du scrutin                            | "2024-11-17"               |
| election_date_round_2| date                                       | Date du second tour                        | null                       |
| registration_deadline| timestamp                                  | Date limite d'inscription                  | "2024-10-01T00:00:00Z"     |
| campaign_start_date  | date                                       | Début de campagne                          | "2024-10-27"               |
| campaign_end_date    | date                                       | Fin de campagne                            | "2024-11-15"               |
| description          | text                                       | Description générale                       | "Élections législatives..." |
| registered_voters    | int                                        | Nombre d'électeurs inscrits                | 7371891                    |
| voters_count         | int                                        | Nombre de votants                          | 3650120                    |
| null_ballots         | int                                        | Nombre de bulletins nuls                   | 26487                      |
| valid_votes          | int                                        | Suffrages valablement exprimés             | 3623633                    |
| absolute_majority    | int                                        | Majorité absolue (présidentielle)          | 1811817                    |
| national_quotient    | float                                      | Quotient national (législative)            | 68370.0                    |
| documents            | M2M → documents (via `elections_documents`)| Documents liés (code électoral, PLF, etc.) | [...]                      |

> 🔁 Une élection peut contenir plusieurs coalitions, listes, candidats, circonscriptions et résultats.
> 📊 Les champs `registered_voters`, `voters_count`, `null_ballots`, `valid_votes` permettent d'afficher les statistiques KPI sur le dashboard.
> 🏆 Le champ `absolute_majority` est utilisé pour les élections présidentielles, `national_quotient` pour les législatives.

---

### 2️⃣ `election_coalition` — *Coalitions/Partis politiques*

Entités politiques participant aux élections.

| Champ              | Type                                       | Description                              | Exemple          |
| ------------------ | ------------------------------------------ | ---------------------------------------- | ---------------- |
| id                 | int                                        | ID interne                               | 1                |
| status             | string (`draft`, `published`, `archived`)  | État de publication                      | "published"      |
| sort               | int                                        | Ordre d'affichage                        | 1                |
| user_created       | uuid → directus_users                      | Créateur                                 | "uuid..."        |
| date_created       | timestamp                                  | Date de création                         | ...              |
| user_updated       | uuid → directus_users                      | Dernier modificateur                     | "uuid..."        |
| date_updated       | timestamp                                  | Date de modification                     | ...              |
| name               | string                                     | Nom de la coalition                      | "PASTEF"         |
| list_order         | int                                        | Ordre de la liste (numéro de bulletin)   | 1                |
| acronym            | string                                     | Sigle/acronyme                           | "PASTEF"         |
| logo               | uuid → directus_files                      | Logo de la coalition                     | "abc123..."      |
| description        | string                                     | Description de la coalition              | "Parti patriote..."|
| type               | enum (`coalition`, `party`, `independent`) | Type d'entité politique                  | "coalition"      |
| bulletin           | uuid → directus_files                      | Image du bulletin de vote                | "bulletin123..." |
| list_file          | uuid → directus_files                      | Fichier PDF de la liste                  | "list123..."     |
| head_of_list       | M2O → election_candidates                  | Tête de liste (candidat)                 | 1                |
| videos             | O2M → election_coalition_videos            | Vidéos de la coalition                   | [...]            |
| color              | string (hex)                               | Couleur de la coalition (pour graphiques)| "#E63946"        |
| voix               | int                                        | Nombre total de voix                     | 1234567          |
| pourcentage        | float                                      | Pourcentage de voix (%)                  | 54.28            |
| sieges             | int                                        | Nombre total de sièges obtenus           | 130              |
| sieges_departement | int                                        | Sièges au scrutin départemental          | 83               |
| sieges_national    | int                                        | Sièges au scrutin national               | 47               |

> ⚠️ Pour les résultats, les champs utilisent des noms en français (`voix`, `pourcentage`, `sieges`).

---

### 3️⃣ `election_electoral_lists` — *Listes électorales*

Listes de candidats déposées par les coalitions.

| Champ           | Type                                             | Description                          | Exemple                        |
| --------------- | ------------------------------------------------ | ------------------------------------ | ------------------------------ |
| id              | int                                              | ID interne                           | 1                              |
| status          | string (`draft`, `published`, `archived`)        | État de publication                  | "published"                    |
| user_created    | uuid → directus_users                            | Créateur                             | "uuid..."                      |
| date_created    | timestamp                                        | Date de création                     | ...                            |
| user_updated    | uuid → directus_users                            | Dernier modificateur                 | "uuid..."                      |
| date_updated    | timestamp                                        | Date de modification                 | ...                            |
| name            | string                                           | Nom de la liste                      | "Liste nationale PASTEF"       |
| type            | enum (`national`, `departmental`, `communale`, `diaspora`) | Type de liste              | "national"                     |
| coalition       | M2O → election_coalition                         | Coalition associée                   | 1                              |
| election        | M2O → elections                                  | Élection associée                    | 1                              |
| is_substitute   | boolean                                          | Liste de suppléants                  | false                          |
| constituency    | M2O → election_constituencies                    | Circonscription                      | 5                              |
| candidates      | O2M → election_candidates                        | Candidats de la liste                | [...]                          |

> 💡 Pour les **élections présidentielles**, il y a une seule liste "nationale" par coalition.
> Pour les **élections législatives/locales**, il peut y avoir plusieurs listes départementales/locales par coalition.
> 📋 Le champ `candidates` est une relation O2M permettant de lister tous les candidats de la liste.

---

### 4️⃣ `election_candidates` — *Candidats*

Profils détaillés des candidats.

| Champ           | Type                         | Description                    | Exemple                  |
| --------------- | ---------------------------- | ------------------------------ | ------------------------ |
| id              | int                          | ID interne                     | 1                        |
| first_name      | string                       | Prénom                         | "Amadou"                 |
| last_name       | string                       | Nom de famille                 | "BA"                     |
| birthdate       | date                         | Date de naissance              | "1961-05-19"             |
| birthplace      | string                       | Lieu de naissance              | "Dakar"                  |
| gender          | enum (`M`, `F`)              | Sexe                           | "M"                      |
| position        | int                          | Position dans la liste         | 1                        |
| profession      | string                       | Profession                     | "Économiste"             |
| electoral_list  | M2O → election_electoral_lists | Liste électorale             | 1                        |
| photo           | uuid → directus_files        | Photo du candidat              | "photo123..."            |
| is_elected      | boolean                      | Élu ou non                     | true                     |
| documents       | M2O → documents              | Programme/document du candidat | 1                        |
| tags            | csv                          | Tags                           | "pastef,dakar"           |
| is_outgoing_deputy | boolean                   | Député sortant                 | false                    |
| facebook        | string                       | Lien Facebook                  | "https://..."            |
| twitter         | string                       | Lien Twitter/X                 | "https://..."            |
| biography       | text                         | Biographie complète            | "Amadou BA est..."       |
| notes           | text                         | Notes internes                 | "..."                    |
| elected_replacement | boolean                  | Élu suppléant remplaçant       | false                    |
| voter_number    | string                       | Numéro d'électeur              | "SN123456"               |
| status          | string                       | État de publication            | "published"              |

> 📊 Les **statistiques** (sexe, âge, profession) sont calculées à partir de cette collection.

---

### 5️⃣ `election_constituencies` — *Circonscriptions électorales*

Découpage géographique pour les élections législatives et locales.

| Champ           | Type                                      | Description                          | Exemple      |
| --------------- | ----------------------------------------- | ------------------------------------ | ------------ |
| id              | int                                       | ID interne                           | 1            |
| name            | string                                    | Nom de la circonscription            | "Dakar"      |
| type            | enum (`department`, `diaspora`)            | Type de circonscription              | "department" |
| nationale_type  | string (select-dropdown)                  | Type de circonscription nationale    | "majoritaire"|
| seats           | int                                       | Nombre de sièges alloués             | 20           |
| region          | string                                    | Région (pour départements)           | "Dakar"      |
| parent          | M2O → election_constituencies             | Relation hiérarchique parent         | null         |
| sort            | int                                       | Ordre d'affichage                    | 1            |
| status          | string                                    | État de publication                  | "published"  |

> 📝 Les champs `nationale_type` et `parent` sont des ajouts du nouveau schéma.
> 🌳 Le champ `parent` permet de créer des hiérarchies (département → arrondissement → commune).

---

### 6️⃣ `election_map_national` — *Bureaux de vote nationaux*

Liste des lieux de vote et bureaux de vote au Sénégal.

| Champ               | Type                    | Description                          | Exemple          |
| ------------------- | ----------------------- | ------------------------------------ | ---------------- |
| id                  | int                     | ID interne                           | 1                |
| election            | M2O → elections         | Élection associée                    | 1                |
| polling_place       | string                  | Lieu de vote                         | "École Plateau"  |
| office_number       | int                     | Numéro du bureau                     | 1                |
| voters              | int                     | Nombre d'inscrits                    | 500              |
| implantation        | string                  | Implantation                         | "Urbain"         |
| municipality        | string                  | Commune                              | "Plateau"        |
| department          | string                  | Département                          | "Dakar"          |
| region              | string                  | Région                               | "Dakar"          |

---

### 7️⃣ `election_map_diaspora` — *Bureaux de vote diaspora*

Liste des lieux de vote et bureaux de vote à l'étranger.

| Champ                      | Type                    | Description                    | Exemple              |
| -------------------------- | ----------------------- | ------------------------------ | -------------------- |
| id                         | int                     | ID interne                     | 1                    |
| election                   | M2O → elections         | Élection associée              | 1                    |
| diplomatic_representation  | string                  | Représentation diplomatique    | "Ambassade Paris"    |
| country                    | string                  | Pays                           | "France"             |
| locality                   | string                  | Localité                       | "Paris"              |
| polling_place              | string                  | Lieu de vote                   | "Consulat Paris"     |
| office_number              | int                     | Numéro du bureau               | 1                    |
| voters                     | int                     | Nombre d'inscrits              | 200                  |

---

### 8️⃣ `carte` — *Carte électorale avec données géographiques*

Données cartographiques départementales avec résultats et participation.

| Champ               | Type                             | Description                          | Exemple        |
| ------------------- | -------------------------------- | ------------------------------------ | -------------- |
| id                  | int                              | ID interne                           | 1              |
| election            | M2O → elections                  | Élection associée                    | 1              |
| coalition_gagnante  | M2O → election_coalition         | Coalition gagnante                   | 1              |
| constituencie       | M2O → election_constituencies   | Circonscription concernée            | 5              |
| winning_list      | M2O → election_electoral_lists   | Liste gagnante                       | 3              |
| voters              | int                              | Nombre d'inscrits                    | 50000          |
| seat                | int                              | Nombre de sièges                     | 7              |
| region              | string                           | Région                               | "Dakar"        |
| departement         | string                           | Département                          | "Dakar"        |
| municipality        | string                           | Commune                              | "Plateau"      |
| participation_10h   | float                            | Participation à 10h (%)              | 15.5           |
| participation_12h   | float                            | Participation à 12h (%)              | 28.3           |
| participation_14h   | float                            | Participation à 14h (%)              | 42.1           |
| participation_17h   | float                            | Participation à 17h (%)              | 55.8           |
| offices             | int                              | Nombre de bureaux de vote            | 120            |
| places              | int                              | Nombre de lieux de vote              | 30             |
| population          | int                              | Population                           | 150000         |
| Position            | geometry.Polygon                 | Contour géographique (GeoJSON)       | {...}          |

---

### 9️⃣ `election_electoral_guide` — *Guides vidéos YouTube*

Tutoriels vidéos pour expliquer le processus électoral.

| Champ        | Type                                       | Description                   | Exemple                       |
| ------------ | ------------------------------------------ | ----------------------------- | ----------------------------- |
| id           | int                                        | ID interne                    | 1                             |
| titre        | string                                     | Titre de la vidéo             | "Comment voter en 2024 ?"     |
| description  | text (Markdown)                            | Description                   | "Tutoriel pas à pas..."       |
| url_youtube  | string (URL)                               | Lien YouTube                  | "https://youtube.com/..."     |
| type_election| enum (`presidentielle`, `legislative`, `locale`) | Type d'élection               | "legislative"                 |
| langue       | string                                     | Langue de la vidéo            | "Français"                    |
| sort         | int                                        | Ordre d'affichage             | 1                             |
| status       | string                                     | État de publication           | "published"                   |

---

### 🔟 `election_coalition_videos` — *Vidéos des coalitions*

Vidéos promotionnelles, meetings ou témoignages des coalitions.

| Champ        | Type                    | Description           | Exemple                  |
| ------------ | ----------------------- | --------------------- | ------------------------ |
| id           | int                     | ID interne            | 1                        |
| titre        | string                  | Titre de la vidéo     | "Meeting PASTEF Dakar"   |
| url_youtube  | string (URL)            | Lien YouTube          | "https://youtube.com/..." |
| coalition_id | M2O → election_coalition | Coalition associée    | 1                        |
| sort         | int                     | Ordre d'affichage     | 1                        |
| status       | string                  | État de publication   | "published"              |

---

### 1️⃣1️⃣ `documents` — *Documents (électoraux)*

Documents liés aux élections (code électoral, programmes, etc.).

| Champ        | Type                     | Description           | Exemple                  |
| ------------ | ------------------------ | --------------------- | ------------------------ |
| id           | int                      | ID interne            | 1                        |
| status       | string                   | État de publication   | "published"              |
| title        | string                   | Titre du document     | "Code électoral 2024"    |
| slug         | string                   | Slug URL              | "code-electoral-2024"    |
| description  | text                     | Description           | "..."                    |
| type         | string                   | Type de document      | "election"               |
| file         | uuid → directus_files    | Fichier PDF           | "file123..."             |
| cover_image  | uuid → directus_files    | Image de couverture   | "img123..."              |
| publish_date | date                     | Date de publication   | "2024-01-01"             |

> 📝 La collection `documents` est utilisée par plusieurs modules. Le type `election` identifie les documents électoraux.

---

## 🧩 Relations principales

```
elections ──┬── election_coalition ──┬── election_electoral_lists ─── election_candidates
            │                        └── election_coalition_videos         └── documents (programme)
            │
            ├── election_constituencies (avec parent → self)
            │
            ├── election_map_national (bureaux de vote nationaux)
            │
            ├── election_map_diaspora (bureaux de vote diaspora)
            │
            ├── carte (données géo + coalition_gagnante, constituencie, winning_list)
            │
            ├── documents (M2M via elections_documents)
            │
            └── election_electoral_guide (filtré par type_election)
```

---

## 📊 Exemples d'utilisation

### Élections

| Champ              | Valeur                      |
| ------------------ | --------------------------- |
| name               | "Législatives 2024"         |
| type               | "legislative"               |
| year               | 2024                        |
| status             | "completed"                 |
| participation_rate | 49.51                       |
| registered_voters  | 7371891                     |
| voters_count       | 3650120                     |
| valid_votes        | 3623633                     |
| null_ballots       | 26487                       |
| national_quotient  | 68370.0                     |
| rounds             | 1                           |
| election_date      | "2024-11-17"                |

### Coalitions (Top 3)

| Coalition       | Voix      | Sièges | % Voix |
| --------------- | --------- | ------ | ------ |
| PASTEF          | 1,234,567 | 130    | 54.28  |
| Samm Sa Kaddu   | 456,789   | 16     | 20.10  |
| Takku Wallu     | 234,567   | 19     | 10.32  |

---

## ⚙️ Notes de gestion

* **Types d'élections** :
  - `presidential` : Élection du Président de la République
  - `legislative` : Élection des députés de l'Assemblée nationale
  - `locale` : Élections municipales et départementales

* **Statuts d'élection** :
  - `scheduled` : Élection programmée (pas encore tenue)
  - `registration` : Phase d'enregistrement des candidatures
  - `campaign` : Période de campagne électorale
  - `ongoing` : Élection en cours (jour du scrutin)
  - `completed` : Élection terminée (résultats publiés)

* **Calculs automatiques** :
  - Les totaux de voix, sièges, pourcentages sont calculés côté serveur (API)
  - Le frontend affiche les données pré-calculées pour optimiser les performances

* **Sources de données** :
  - **Conseil Constitutionnel** : Résultats officiels
  - **Direction Générale des Élections (DGE)** : Cartographie, bureaux de vote
  - **Vie-publique.sn** : Données compilées et enrichies

---
