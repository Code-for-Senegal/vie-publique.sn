# 🗳️ Elections – Modèle et Règles (mise à jour 2026-02-15)

## 🎯 Objectifs

* Publier les **données électorales** pour tous types d'élections (Présidentielles, Législatives, Locales)
* Gérer les **coalitions, listes électorales et candidats** avec leurs profils détaillés
* Afficher les **résultats en temps réel** par département, commune et bureau de vote
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
| status               | string (`draft`, `published`, `archived`)  | État de publication                        | "published"                |
| sort                 | int                                        | Ordre d'affichage                          | 1                          |
| name                 | string                                     | Nom de l'élection (unique)                 | "Législatives 2024"        |
| year                 | int                                        | Année de l'élection                        | 2024                       |
| type                 | enum (`legislative`, `presidential`, `locale`) | Type d'élection                        | "legislative"              |
| participation_rate   | float                                      | Taux de participation (%)                  | 51.2                       |
| processed_pv_rate    | float                                      | Taux de PV traités (%)                     | 100.0                      |
| rounds               | int (défaut: 1)                            | Nombre de tours                            | 1                          |
| election_date        | date                                       | Date du scrutin                            | "2024-11-17"               |
| date_round_2         | date                                       | Date du second tour                        | null                       |
| registration_deadline| timestamp                                  | Date limite d'inscription                  | "2024-10-01T00:00:00Z"     |
| campaign_start_date  | date                                       | Début de campagne                          | "2024-10-27"               |
| campaign_end_date    | date                                       | Fin de campagne                            | "2024-11-15"               |
| description          | text                                       | Description générale                       | "Élections législatives..." |
| documents            | M2M → documents (via `elections_documents`)| Documents liés (code électoral, PLF, etc.) | [...]                      |
| related_elections    | M2M → elections (via `elections_elections`) | Élections liées (1er/2nd tour, etc.)       | [...]                      |

> 🔁 Une élection peut contenir plusieurs coalitions, listes, candidats, circonscriptions et résultats.
> 📝 Les champs `total_seats`, `total_voters`, `total_votes`, `is_featured` ne sont PAS dans le schéma Directus — ils sont calculés côté API/frontend.

---

### 2️⃣ `election_coalition` — *Coalitions/Partis politiques*

Entités politiques participant aux élections.

| Champ           | Type                | Description                              | Exemple          |
| --------------- | ------------------- | ---------------------------------------- | ---------------- |
| id              | int                 | ID interne                               | 1                |
| name            | string              | Nom de la coalition                      | "PASTEF"         |
| acronym         | string              | Sigle/acronyme                           | "PASTEF"         |
| color           | string (hex)        | Couleur de la coalition (pour graphiques) | "#E63946"        |
| logo            | uuid → directus_files | Logo de la coalition                     | "abc123..."      |
| description     | text                | Description de la coalition              | "Parti patriote..." |
| leader_name     | string              | Nom du leader                            | "Ousmane Sonko"  |
| ranking         | int                 | Classement final (1er, 2e, etc.)         | 1                |
| total_votes     | int                 | Nombre total de voix                     | 1234567          |
| total_seats     | int                 | Nombre de sièges obtenus                 | 130              |
| vote_percentage | float               | Pourcentage de voix (%)                     | 1                |
| videos          | O2M → election_coalition_videos | Vidéos de la coalition (témoignages, meetings) | [...] |
| status          | string              | État de publication                      | "published"      |

---

### 3️⃣ `election_electoral_lists` — *Listes électorales*

Listes de candidats déposées par les coalitions.

| Champ           | Type                      | Description                          | Exemple                        |
| --------------- | ------------------------- | ------------------------------------ | ------------------------------ |
| id              | int                       | ID interne                           | 1                              |
| name            | string                    | Nom de la liste                      | "Liste nationale PASTEF"       |
| type            | enum (`national`, `departmental`, `local`) | Type de liste                        | "national"                     |
| coalition_id    | M2O → election_coalition  | Coalition associée                   | 1                              |
| constituency_id | M2O → election_constituencies | Circonscription (pour listes départementales/locales) | 5 |
| total_candidates | int                      | Nombre total de candidats            | 53                             |
| ranking         | int                       | Classement dans la circonscription   | 1                              |
| total_votes     | int                       | Voix obtenues dans la circonscription | 123456                         |
| vote_percentage | float                     | Pourcentage de voix (%)              | 60.5                           |
| seats_won       | int                       | Sièges remportés                     | 3                              |
| status          | string                    | État de publication                  | "published"                    |

> 💡 Pour les **élections présidentielles**, il y a une seule liste "nationale" par coalition.
> Pour les **élections législatives/locales**, il peut y avoir plusieurs listes départementales/locales par coalition.

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
| role            | enum (`titulaire`, `suppleant`, `autre`) | Rôle du candidat      | "titulaire"              |
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

> ⚠️ Le champ `is_substitute` a été supprimé et remplacé par `role` (titulaire/suppleant/autre).
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

### 8️⃣ `Bureau_vote` — *Bureaux de vote*

Détails des bureaux de vote (utilisés pour les PV).

| Champ              | Type   | Description                  | Exemple                     |
| ------------------ | ------ | ---------------------------- | --------------------------- |
| id                 | int    | ID interne                   | 1                           |
| departement        | string | Département                  | "Dakar"                     |
| commune            | string | Commune                      | "Plateau"                   |
| repDiplomatique    | string | Représentation diplomatique  | null                        |
| localite           | string | Localité                     | "Plateau"                   |
| bureau             | string | Numéro/nom du bureau         | "Bureau 001"                |
| source             | string | Source du PV (conseil_const, vie_publique) | "conseil_const" |

---

### 9️⃣ `chargement_pv` — *Procès-verbaux (PVs)*

Images des procès-verbaux officiels.

| Champ        | Type                  | Description           | Exemple              |
| ------------ | --------------------- | --------------------- | -------------------- |
| id           | int                   | ID interne            | 1                    |
| photo        | uuid → directus_files | Image du PV           | "pv123..."           |
| bureau       | M2O → Bureau_vote     | Bureau de vote lié    | 1                    |
| source       | string                | Source du PV          | "conseil_const"      |
| results      | json                  | Résultats extraits    | {"coalition_1": 120} |

---

### 🔟 `resultats` — *Résultats par bureau*

Résultats détaillés par bureau de vote.

| Champ               | Type              | Description                  | Exemple |
| ------------------- | ----------------- | ---------------------------- | ------- |
| id                  | int               | ID interne                   | 1       |
| bureau_id           | M2O → Bureau_vote | Bureau de vote               | 1       |
| coalition_id        | M2O → election_coalition | Coalition                    | 1       |
| votes               | int               | Nombre de voix               | 120     |
| percentage          | float             | Pourcentage de voix (%)      | 45.5    |
| total_votes         | int               | Total de voix dans le bureau | 264     |
| total_voters        | int               | Nombre d'inscrits            | 500     |
| participation_rate  | float             | Taux de participation (%)    | 52.8    |

---

### 1️⃣1️⃣ `documents` — *Documents légaux et officiels*

> ⚠️ **Note** : La collection `documents` existe déjà en production. Deux types de relations existent avec les élections :
> 2. Relation M2M via `elections_documents` : Permet de lier un document à plusieurs élections

Documents PDF liés aux élections (code électoral, guides, etc.).

| Champ        | Type                 | Description                  | Exemple                 |
| ------------ | -------------------- | ---------------------------- | ----------------------- |
| id           | int                  | ID interne                   | 1                       |
| status       | string               | État de publication          | "published"             |
| type         | string (select)      | Type de document             | "election"              |
| publish_date | date                 | Date de publication          | "2024-01-15"            |
| title        | string               | Titre du document            | "Code Électoral 2024"   |
| description  | string               | Description courte           | "Code électoral..."     |
| slug         | string               | Slug URL                     | "code-electoral-2024"   |
| file         | uuid → directus_files | Fichier PDF                 | "doc123..."             |
| cover_image  | uuid → directus_files | Image de couverture         | "cover123..."           |

> 📝 **Important** : Le champ `type` inclut les options : `official_journal`, `law`, `decree`, `council_of_ministers`, `communique`, `strategy`, `budget`, `code`, `speech`, `government_bill`, `audit_report`, `uncategorized`, `international_report`, **`election`**, `programme`.

---

### 1️⃣2️⃣ `carte` — *Carte électorale avec données géographiques*

Données cartographiques départementales avec résultats et participation.

| Champ               | Type                             | Description                          | Exemple        |
| ------------------- | -------------------------------- | ------------------------------------ | -------------- |
| id                  | int                              | ID interne                           | 1              |
| election            | M2O → elections                  | Élection associée                    | 1              |
| coalition_gagnante  | M2O → election_coalition         | Coalition gagnante                   | 1              |
| constituencie       | M2O → election_constituencies   | Circonscription concernée            | 5              |
| liste_gagnante      | M2O → election_electoral_lists   | Liste gagnante                       | 3              |
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

### 1️⃣3️⃣ `election_electoral_guide` — *Guides vidéos YouTube* ⭐ NOUVELLE

> ✅ **Nouvelle collection** créée pour le dashboard électoral.

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

### 1️⃣4️⃣ `election_coalition_videos` — *Vidéos des coalitions*

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

## 🧩 Relations principales

```
elections ──┬── election_coalition ──┬── election_electoral_lists ──┬── election_candidates
            │                        └── election_coalition_videos        └── documents (programme)
            │
            ├── election_constituencies (avec parent → self)
            │
            ├── election_map_national (bureaux de vote nationaux)
            │
            ├── election_map_diaspora (bureaux de vote diaspora)
            │
            ├── carte (données géo + coalition_gagnante, constituencie, liste_gagnante)
            │
            ├── Bureau_vote ──┬── chargement_pv
            │                 └── resultats
            │
            ├── documents (M2M via elections_documents)
            │
            ├── elections (M2M self-ref via elections_elections, élections liées)
            │
            └── election_electoral_guide (indépendant, filtré par type_election)
```

---

## 📊 Exemples d'utilisation

### Élections

| Champ              | Valeur                      |
| ------------------ | --------------------------- |
| name               | "Législatives 2024"         |
| type               | "legislative"               |
| year               | 2024                        |
| status             | "published"                 |
| participation_rate | 51.2                        |
| processed_pv_rate  | 100.0                       |
| rounds             | 1                           |
| election_date      | "2024-11-17"                |

### Coalitions (Top 3)

| Coalition       | Voix      | Sièges | % Voix |
| --------------- | --------- | ------ | ------ |
| PASTEF          | 1,234,567 | 130    | 54.28  |
| Samm Sa Kaddu   | 456,789   | 16     | 20.10  |
| Takku Wallu     | 234,567   | 19     | 10.32  |

### Statistiques des candidats

| Statistique            | Valeur |
| ---------------------- | ------ |
| Total candidats        | 1,032  |
| Hommes                 | 516    |
| Femmes                 | 516    |
| Âge moyen              | 42 ans |
| Profession la plus courante | Enseignant |

---

## 🧮 Bonnes pratiques de nommage

| Domaine      | Collection               | Exemple                       |
| ------------ | ------------------------ | ----------------------------- |
| Élection     | elections                | `elections.name`              |
| Coalition    | election_coalition       | `election_coalition.name`     |
| Liste        | election_electoral_lists | `election_electoral_lists.type` |
| Candidat     | election_candidates      | `election_candidates.full_name` |
| Circonscription | election_constituencies | `election_constituencies.name` |

Formule de nommage :
`election_<entity>_<field>`

> Ex : `election_coalition_name`, `election_candidates_profession`, `election_map_national_departement`

---

## ⚙️ Notes de gestion

* **Types d'élections** :
  - `presidentielle` : Élection du Président de la République
  - `legislative` : Élection des députés de l'Assemblée nationale
  - `locale` : Élections municipales et départementales

* **Statuts d'élection** :
  - `scheduled` : Élection programmée (pas encore tenue)
  - `ongoing` : Élection en cours (jour du scrutin)
  - `completed` : Élection terminée (résultats publiés)

* **Calculs automatiques** :
  - Les totaux de voix, sièges, pourcentages sont calculés côté serveur (API)
  - Le frontend affiche les données pré-calculées pour optimiser les performances

* **Sources de données** :
  - **Conseil Constitutionnel** : Résultats officiels et PV
  - **Direction Générale des Élections (DGE)** : Cartographie, bureaux de vote
  - **Vie-publique.sn** : Données compilées et enrichies

---

**Dernière mise à jour** : 2026-02-15
**Version** : 1.2
