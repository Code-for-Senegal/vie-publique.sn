# 🗳️ Elections – Modèle et Règles (mise à jour 2026)

## 🎯 Objectifs

* Publier les **données électorales** pour tous types d'élections (Présidentielles, Législatives, Locales)
* Gérer les **coalitions, listes électorales et candidats** avec leurs profils détaillés
* Afficher les **résultats en temps réel** par département, commune et bureau de vote
* Gérer la **cartographie électorale** (nationale et diaspora)
* Fournir les **statistiques** (participation, répartition par sexe, âge, profession)
* Intégrer les **guides électoraux** (vidéos YouTube) et la **législation** (documents PDF)
* Préparer un modèle stable pour le dashboard électoral de Vie-publique.sn

---

## 🧱 Modèle de données

### 1️⃣ `elections` — *Élections principales*

Table pivot regroupant toutes les élections organisées au Sénégal.

| Champ                | Type                                       | Description                                | Exemple                    |
| -------------------- | ------------------------------------------ | ------------------------------------------ | -------------------------- |
| id                   | int                                        | ID interne                                 | 1                          |
| name                 | string                                     | Nom de l'élection                          | "Législatives 2024"        |
| type                 | enum (`presidentielle`, `legislative`, `locale`) | Type d'élection                            | "legislative"              |
| year                 | int                                        | Année de l'élection                        | 2024                       |
| election_date        | date                                       | Date du scrutin                            | "2024-11-17"               |
| status               | enum (`scheduled`, `ongoing`, `completed`) | Statut de l'élection                       | "completed"                |
| description          | text                                       | Description générale                       | "Élections législatives..." |
| participation_rate   | float                                      | Taux de participation (%)                  | 51.2                       |
| processed_pv_rate    | float                                      | Taux de PV traités (%)                     | 100.0                      |
| total_seats          | int                                        | Nombre total de sièges                     | 165                        |
| total_voters         | int                                        | Nombre total d'inscrits                    | 7371890                    |
| total_votes          | int                                        | Nombre total de votants                    | 3776304                    |
| is_featured          | boolean                                    | Afficher en vedette sur la page d'accueil  | true                       |
| documents            | O2M → documents                            | Documents liés (code électoral, PLF, etc.) | [...]                      |
| status               | string (`draft`, `published`)              | État de publication                        | "published"                |

> 🔁 Une élection peut contenir plusieurs coalitions, listes, candidats, circonscriptions et résultats.

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
| vote_percentage | float               | Pourcentage de voix (%)                  | 54.28            |
| election_id     | M2O → elections     | Élection associée                        | 1                |
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
| full_name       | string (auto)                | Nom complet (concaténé)        | "Amadou BA"              |
| photo           | uuid → directus_files        | Photo du candidat              | "photo123..."            |
| gender          | enum (`M`, `F`)              | Sexe                           | "M"                      |
| birthdate       | date                         | Date de naissance              | "1961-05-19"             |
| birthplace      | string                       | Lieu de naissance              | "Dakar"                  |
| profession      | string                       | Profession                     | "Économiste"             |
| biography       | text (Markdown)              | Biographie complète            | "Amadou BA est..."       |
| position        | int                          | Position dans la liste         | 1                        |
| is_elected      | boolean                      | Élu ou non                     | true                     |
| electoral_list_id | M2O → election_electoral_lists | Liste électorale              | 1                        |
| status          | string                       | État de publication            | "published"              |

> 📊 Les **statistiques** (sexe, âge, profession) sont calculées à partir de cette collection.

---

### 5️⃣ `election_constituencies` — *Circonscriptions électorales*

Découpage géographique pour les élections législatives et locales.

| Champ        | Type                  | Description                          | Exemple      |
| ------------ | --------------------- | ------------------------------------ | ------------ |
| id           | int                   | ID interne                           | 1            |
| name         | string                | Nom de la circonscription            | "Dakar"      |
| type         | enum (`department`, `diaspora`) | Type de circonscription              | "department" |
| code         | string                | Code ISO ou code géographique        | "DK"         |
| region       | string                | Région (pour départements)           | "Dakar"      |
| country      | string                | Pays (pour diaspora)                 | null         |
| total_seats  | int                   | Nombre de sièges alloués             | 20           |
| total_voters | int                   | Nombre d'inscrits                    | 1234567      |
| total_votes  | int                   | Nombre de votants                    | 654321       |
| election_id  | M2O → elections       | Élection associée                    | 1            |
| status       | string                | État de publication                  | "published"  |

---

### 6️⃣ `election_map_national` — *Carte électorale nationale*

Données cartographiques pour les départements au Sénégal.

| Champ               | Type                    | Description                          | Exemple |
| ------------------- | ----------------------- | ------------------------------------ | ------- |
| id                  | int                     | ID interne                           | 1       |
| region              | string                  | Région                               | "Dakar" |
| departement         | string                  | Département                          | "Dakar" |
| coalition_gagnante  | M2O → election_coalition | Coalition gagnante                   | 1       |
| seat                | int                     | Nombre de sièges                     | 20      |
| participation_10h   | float                   | Participation à 10h (%)              | 15.5    |
| participation_12h   | float                   | Participation à 12h (%)              | 28.3    |
| participation_14h   | float                   | Participation à 14h (%)              | 42.1    |
| participation_16h   | float                   | Participation à 16h (%)              | 55.8    |
| participation_18h   | float                   | Participation à 18h (%)              | 51.2    |
| election_id         | M2O → elections         | Élection associée                    | 1       |

---

### 7️⃣ `election_map_diaspora` — *Carte électorale diaspora*

Données cartographiques pour les bureaux de vote à l'étranger.

| Champ              | Type                    | Description                | Exemple        |
| ------------------ | ----------------------- | -------------------------- | -------------- |
| id                 | int                     | ID interne                 | 1              |
| country            | string                  | Pays                       | "France"       |
| continent          | string                  | Continent                  | "Europe"       |
| coalition_gagnante | M2O → election_coalition | Coalition gagnante         | 1              |
| seat               | int                     | Nombre de sièges           | 5              |
| participation_rate | float                   | Taux de participation (%)  | 35.7           |
| election_id        | M2O → elections         | Élection associée          | 1              |

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

> ⚠️ **Note** : La collection `documents` existe déjà en production. Le champ `election_id` a été ajouté pour lier les documents aux élections.

Documents PDF liés aux élections (code électoral, guides, etc.).

| Champ       | Type                 | Description                  | Exemple                 |
| ----------- | -------------------- | ---------------------------- | ----------------------- |
| id          | int                  | ID interne                   | 1                       |
| title       | string               | Titre du document            | "Code Électoral 2024"   |
| type        | string               | Type de document (ajouter "election" pour les docs électoraux) | "election"              |
| file        | uuid → directus_files | Fichier PDF                  | "doc123..."             |
| election_id | M2O → elections      | Élection associée (optionnel) | 1                       |
| year        | int                  | Année du document            | 2024                    |
| status      | string               | État de publication          | "published"             |

> 📝 **Important** : Le champ `type` doit inclure l'option `"election"` pour identifier les documents en rapport avec une élection.

> 🔗 Relation **O2M directe** : Un document appartient à **une seule** élection via `election_id`.

---

### 1️⃣2️⃣ `guide_electorale` — *Guides vidéos YouTube* ⭐ NOUVELLE

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

### 1️⃣3️⃣ `election_coalition_videos` — *Vidéos des coalitions*

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
            │                        └── election_coalition_videos
            │
            ├── election_constituencies
            │
            ├── election_map_national
            │
            ├── election_map_diaspora
            │
            ├── Bureau_vote ──┬── chargement_pv
            │                 └── resultats
            │
            ├── documents
            │
            └── guide_electorale (indépendant, filtré par type_election)
```

---

## 📊 Exemples d'utilisation

### Élections

| Champ             | Valeur                      |
| ----------------- | --------------------------- |
| name              | "Législatives 2024"         |
| type              | "legislative"               |
| year              | 2024                        |
| status            | "completed"                 |
| participation_rate| 51.2                        |
| total_seats       | 165                         |
| total_voters      | 7371890                     |

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

**Dernière mise à jour** : 2026-01-05
**Version** : 1.0
