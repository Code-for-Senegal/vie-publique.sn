# Guide d'Insertion des Données Électorales

Ce guide décrit le processus d'insertion des données électorales dans Directus pour chaque type d'élection : **Présidentielle**, **Législative** et **Locale**.

---

## 📋 Table des matières

1. [Ordre d'insertion (toutes élections)](#ordre-dinsertion-toutes-élections)
2. [Élection Présidentielle](#élection-présidentielle)
3. [Élection Législative](#élection-législative)
4. [Élection Locale](#élection-locale)
5. [Données cartographiques](#données-cartographiques)
6. [Contenus complémentaires](#contenus-complémentaires)
7. [Checklist par type d'élection](#checklist-par-type-délection)

---

### Collections impliquées

| Collection                  | Description                                | Ordre |
| --------------------------- | ------------------------------------------ | ----- |
| `elections`                 | Élection principale                        | 1     |
| `election_constituencies`   | Circonscriptions (départements, diaspora)  | 2     |
| `election_coalition`        | Coalitions/Partis (sans head_of_list)      | 2     |
| `election_electoral_lists`  | Listes de candidats                        | 3     |
| `election_candidates`       | Candidats individuels                      | 4     |
| `election_coalition` (MAJ)  | Mise à jour du head_of_list                | 5     |
| `carte`                     | Données cartographiques et résultats       | 6     |
| `election_map_national`     | Bureaux de vote nationaux                  | 2-6   |
| `election_map_diaspora`     | Bureaux de vote diaspora                   | 2-6   |
| `election_electoral_guide`  | Guides vidéos (indépendant)                | Any   |
| `election_coalition_videos` | Vidéos des coalitions                      | 4+    |
| `documents`                 | Documents électoraux                       | Any   |

---

## Ordre d'insertion (toutes élections)

### Étape 1 : Créer l'élection

**Collection** : `elections`

```json
{
  "name": "Législatives 2024",
  "type": "legislative",           // "presidential", "legislative", "locale"
  "year": 2024,
  "status": "scheduled",           // "scheduled", "registration", "campaign", "ongoing", "completed"
  "rounds": 1,
  "election_date": "2024-11-17",
  "election_date_round_2": null,
  "registration_deadline": "2024-10-01T00:00:00Z",
  "campaign_start_date": "2024-10-27",
  "campaign_end_date": "2024-11-15",
  "description": "Description de l'élection..."
}
```

**Champs statistiques** (à remplir après le scrutin) :
- `registered_voters` : Nombre d'inscrits
- `voters_count` : Nombre de votants
- `null_ballots` : Bulletins nuls
- `valid_votes` : Suffrages valablement exprimés
- `participation_rate` : Taux de participation (%)
- `national_quotient` : Quotient national (législatives)
- `absolute_majority` : Majorité absolue (présidentielles)

---

### Étape 2 : Créer les circonscriptions

**Collection** : `election_constituencies`

```json
{
  "name": "Dakar",
  "type": "department",            // "department" ou "diaspora"
  "nationale_type": "departement", // "departement", "commune", "majoritaire", "proportionnel"
  "region": "Dakar",
  "seats": 7,
  "status": "published",
  "parent": null                   // ID du parent pour hiérarchie
}
```

**Types de circonscriptions** :

| Type élection     | Type circonscription | nationale_type      |
| ----------------- | -------------------- | ------------------- |
| Presidential      | department/diaspora  | departement         |
| Legislative       | department/diaspora  | departement/majoritaire |
| Locale            | department           | commune             |

---

### Étape 3 : Créer les coalitions (SANS head_of_list)

**Collection** : `election_coalition`

> ⚠️ **Important** : Créer d'abord SANS `head_of_list` car les candidats n'existent pas encore.

```json
{
  "name": "PASTEF",
  "acronym": "PASTEF",
  "type": "coalition",             // "coalition", "party", "independent"
  "color": "#E63946",
  "list_order": 1,                 // Numéro du bulletin
  "description": "Patriotes Africains du Sénégal pour le Travail, l'Éthique et la Fraternité",
  "logo": "<logo_de_la_coalition>",
  "bulletin": "<bulletin_de_la_coalition>",    // Image du bulletin
  "list_file": "<liste_de_la_coalition>",   // PDF de la liste
  "status": "published",
  "head_of_list": null             // 🚨 Sera mis à jour à l'étape 6
}
```

---

### Étape 4 : Créer les listes électorales

**Collection** : `election_electoral_lists`

```json
{
  "name": "Liste nationale PASTEF",
  "type": "national",              // "national", "departmental", "communale", "diaspora"
  "coalition": 1,                  // ID de la coalition
  "election": 1,                   // ID de l'élection
  "constituency": null,            // ID de la circonscription (si départementale/communale)
  "is_substitute": false,          // true pour les listes de suppléants
  "status": "published"
}
```

**Types de listes par élection** :

| Type élection     | Types de listes                               |
| ----------------- | --------------------------------------------- |
| Presidential      | `national` uniquement                         |
| Legislative       | `national` + `departmental` + `diaspora`      |
| Locale            | `communale` uniquement                        |

---

### Étape 5 : Créer les candidats

**Collection** : `election_candidates`

```json
{
  "first_name": "Ousmane",
  "last_name": "SONKO",
  "birthdate": "1975-07-15",
  "birthplace": "Thiès",
  "gender": "M",                   // "M" ou "F"
  "profession": "Inspecteur des impôts",
  "position": 1,                   // Position dans la liste
  "is_substitute": true,            // "titulaire", "suppleant"
  "electoral_list": 1,             // ID de la liste électorale
  "photo": "<photo_du_candidat>",
  "biography": "Biographie complète...",
  "is_elected": false,             // 🏆 Mis à jour après résultats
  "is_outgoing_deputy": false,     // Député sortant
  "elected_replacement": false,    // Suppléant devenu élu
  "facebook": "https://facebook.com/...",
  "twitter": "https://twitter.com/...",
  "voter_number": "123456",
  "documents": null,               // ID du document (programme du candidat utilisé principalement pour une élection présidentielle)
  "status": "published"
}
```

---

### Étape 6 : Mettre à jour les coalitions (head_of_list)

**Collection** : `election_coalition` (UPDATE)

> ✅ Maintenant que les candidats existent, on peut lier la tête de liste.

```json
{
  "head_of_list": 42               // ID du candidat tête de liste
}
```

---

### Étape 7 : Résultats et données cartographiques

Voir la section [Données cartographiques](#données-cartographiques).

---

## Élection Présidentielle

### Spécificités

- **Type** : `presidential`
- **Circonscriptions** : Départements + Diaspora (pas de communes)
- **Listes** : Une seule liste `national` par candidat/coalition
- **Statistiques** : `absolute_majority` obligatoire
- **Carte** : Pas de `winning_list`, uniquement `coalition_gagnante`

### Processus d'insertion

```
1. Créer l'élection (type: "presidential")
2. Créer les circonscriptions (46 départements + zones diaspora)
3. Créer les coalitions/candidats indépendants
4. Pour chaque coalition → créer UNE liste nationale
5. Créer LE candidat principal (position 1)
6. Mettre à jour coalition.head_of_list
7. Importer les bureaux de vote (election_map_national, election_map_diaspora)
8. Après résultats :
   - Mettre à jour coalition.voix, coalition.pourcentage
   - Créer les entrées carte par département avec coalition_gagnante
   - Mettre à jour election (participation_rate, registered_voters, etc.)
   - Marquer le candidat élu (is_elected: true)
```

### Exemple de données

```json
// Coalition présidentielle
{
  "name": "Diomaye Président",
  "acronym": "DP",
  "type": "coalition",
  "list_order": 17,
  "voix": 2434854,
  "pourcentage": 54.28,
  "sieges": null                   // Pas de sièges en présidentielle
}

// Carte présidentielle
{
  "election": 1,
  "departement": "Dakar",
  "region": "Dakar",
  "coalition_gagnante": 1,         // Coalition qui a gagné ce département
  "winning_list": null,            // Pas utilisé en présidentielle
  "voters": 850000,
  "participation_10h": 15.2,
  "participation_12h": 28.5,
  "participation_14h": 42.1,
  "participation_17h": 58.3
}
```

---

## Élection Législative

### Spécificités

- **Type** : `legislative`
- **Circonscriptions** : Départements + Diaspora
- **Listes** : `national` + `departmental` par coalition
- **Statistiques** : `national_quotient` obligatoire
- **Sièges** : Répartis entre national et départemental

### Processus d'insertion

```
1. Créer l'élection (type: "legislative")
2. Créer les circonscriptions (46 départements + 8 zones diaspora)
3. Créer les coalitions
4. Pour chaque coalition :
   a. Créer la liste nationale (type: "national")
   b. Créer les listes départementales (type: "departmental") pour chaque circonscription
   c. (Optionnel) Créer les listes de suppléants (is_substitute: true)
5. Créer les candidats pour chaque liste
6. Mettre à jour coalition.head_of_list
7. Importer les bureaux de vote
8. Après résultats :
   - Mettre à jour coalition.voix, pourcentage, sieges, sieges_national, sieges_departement
   - Créer les entrées carte avec coalition_gagnante ET winning_list
   - Marquer les candidats élus (is_elected: true)
```

### Exemple de données

```json
// Coalition législative
{
  "name": "PASTEF",
  "voix": 1968013,
  "pourcentage": 54.28,
  "sieges": 130,
  "sieges_national": 47,
  "sieges_departement": 83
}

// Liste départementale
{
  "name": "Liste PASTEF - Dakar",
  "type": "departmental",
  "coalition": 1,
  "election": 1,
  "constituency": 5,               // ID de la circonscription Dakar
  "is_substitute": false
}

// Carte législative
{
  "election": 1,
  "departement": "Dakar",
  "region": "Dakar",
  "coalition_gagnante": 1,
  "constituencie": 5,
  "winning_list": 42,              // ID de la liste gagnante dans ce département
  "seat": 7,                       // Sièges alloués à ce département
  "voters": 850000
}
```

## Élection Locale

### Spécificités

- **Type** : `locale`
- **Circonscriptions** : Communes (avec parent = département)
- **Listes** : `communale` uniquement
- **Carte** : `winning_list` obligatoire (pas de coalition_gagnante)
- **municipality** : Champ obligatoire dans carte

### Processus d'insertion

```
1. Créer l'élection (type: "locale")
2. Créer les circonscriptions :
   a. D'abord les départements (parent: null)
   b. Puis les communes (parent: id_departement, nationale_type: "commune")
3. Créer les coalitions
4. Pour chaque coalition et chaque commune :
   - Créer la liste communale (type: "communale", constituency: id_commune)
5. Créer les candidats pour chaque liste
6. Mettre à jour coalition.head_of_list
7. Après résultats :
   - Créer les entrées carte avec winning_list (obligatoire)
   - Préciser municipality dans carte
```

### Exemple de données

```json
// Circonscription communale
{
  "name": "Plateau",
  "type": "department",            // Même pour les communes
  "nationale_type": "commune",
  "region": "Dakar",
  "parent": 5,                     // ID du département Dakar
  "seats": 1
}

// Liste communale
{
  "name": "Liste PASTEF - Plateau",
  "type": "communale",
  "coalition": 1,
  "election": 1,
  "constituency": 42               // ID de la commune Plateau
}

// Carte locale
{
  "election": 1,
  "departement": "Dakar",
  "region": "Dakar",
  "municipality": "Plateau",       // 🚨 Obligatoire pour élections locales
  "constituencie": 42,
  "coalition_gagnante": null,      // Non utilisé
  "winning_list": 123              // 🚨 Obligatoire - Liste gagnante
}
```

---

## Données cartographiques

### Collection `carte`

Contient les données géographiques et résultats par zone.

```json
{
  "election": 1,
  "departement": "Dakar",
  "region": "Dakar",
  "municipality": null,            // Requis pour élections locales
  "constituencie": 5,
  "coalition_gagnante": 1,         // Pour présidentielle/législative
  "winning_list": 42,              // Pour législative/locale
  "voters": 850000,
  "seat": 7,
  "participation_10h": 15.2,
  "participation_12h": 28.5,
  "participation_14h": 42.1,
  "participation_17h": 58.3,
  "offices": 250,                  // Nombre de bureaux
  "places": 85,                    // Nombre de lieux de vote
  "population": 1200000,
  "Position": { /* GeoJSON Polygon */ }
}
```

### Collection `election_map_national`

Bureaux de vote au Sénégal.

```json
{
  "election": 1,
  "region": "Dakar",
  "department": "Dakar",
  "municipality": "Plateau",
  "polling_place": "École Plateau A",
  "office_number": 1,
  "voters": 500,
  "implantation": "Urbain"
}
```

### Collection `election_map_diaspora`

Bureaux de vote à l'étranger.

```json
{
  "election": 1,
  "diplomatic_representation": "Ambassade du Sénégal à Paris",
  "country": "France",
  "locality": "Paris",
  "polling_place": "Consulat Paris",
  "office_number": 1,
  "voters": 200
}
```

---

## Contenus complémentaires

### Guides électoraux (`election_electoral_guide`)

Vidéos explicatives par type d'élection (indépendant de l'élection).

```json
{
  "titre": "Comment voter aux législatives 2024",
  "description": "Tutoriel complet...",
  "url_youtube": "https://youtube.com/watch?v=...",
  "type_election": "legislative",  // "presidentielle", "legislative", "locale"
  "langue": "Français",
  "status": "published"
}
```

### Vidéos de coalition (`election_coalition_videos`)

```json
{
  "url_youtube": "https://youtube.com/watch?v=...",
  "date": "2024-11-01",
  "election_coalition": 1          // ID de la coalition
}
```

### Documents (`documents`)

```json
{
  "title": "Code électoral 2024",
  "slug": "code-electoral-2024",
  "type": "election",
  "description": "...",
  "file": "<uuid_fichier>",
  "cover_image": "<image_de_couverture_du_document>",
  "publish_date": "2024-01-01"
}
```

---

## 🔧 Conseils pratiques

1. **Ordre strict** : Respectez l'ordre des dépendances pour éviter les erreurs FK
2. **Backup** : Faites un backup avant les imports massifs
3. **Statuts** : Utilisez `draft` pendant l'import, puis `published` une fois validé

---
