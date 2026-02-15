# 🏗️ Architecture des Pages Élections

**Dernière mise à jour** : 2026-02-15

---

## 📁 Structure des fichiers

```
app/pages/elections-senegal/
├── index.vue                             # Landing page
├── guide-electoral.vue                   # Guide de l'électeur
├── legislation.vue                       # Législation électorale
├── dashboard/
│   └── [type]/
│       └── [year].vue                    # Dashboard dynamique
└── carte-electorale/
    ├── index.vue                         # Carte (vue globale)
    ├── nationale/
    │   └── [department].vue              # Détail département
    └── diaspora/
        └── [country].vue                 # Détail pays
```

---

## 🔗 URLs

| URL | Description |
|-----|-------------|
| `/elections-senegal` | Landing page |
| `/elections-senegal/dashboard/legislative/2024` | Dashboard Législatives 2024 |
| `/elections-senegal/dashboard/presidential/2024` | Dashboard Présidentielle 2024 |
| `/elections-senegal/dashboard/locale/2022` | Dashboard Locales 2022 |
| `/elections-senegal/guide-electoral` | Guide de l'électeur |
| `/elections-senegal/legislation` | Législation électorale |
| `/elections-senegal/carte-electorale` | Carte électorale |
| `/elections-senegal/carte-electorale/nationale/dakar` | Détail département Dakar |
| `/elections-senegal/carte-electorale/diaspora/france` | Détail diaspora France |

---

## 📄 Pages

### 1. Landing (`index.vue`)

Point d'entrée avec élection en vedette et accès rapide aux sections.

### 2. Dashboard (`dashboard/[type]/[year].vue`)

Dashboard interactif avec onglets :
- **Candidats** : Listes et candidats
- **Carte** : Carte des résultats
- **Résultats** : Stats et classement coalitions
- **Documents** : Documents liés à l'élection
- **Statistiques** : Professions, sexe, âge
- **Guide** : Vidéos tutoriels

**Params URL** :
- `type` : `legislative`, `presidential`, `locale`
- `year` : Année (ex: `2024`)
- `tab` : Onglet actif (query param)
- `stats_type` : Type de stat (uniquement sur onglet stats)

### 3. Guide Électoral (`guide-electoral.vue`)

Vidéos tutoriels pour expliquer le processus électoral.

### 4. Législation (`legislation.vue`)

Liste des documents électoraux avec filtres par type et année.

**Filtrage** : Utilise `election_ids` (IDs séparés par virgules) pour filtrer sur plusieurs élections.

### 5. Carte Électorale (`carte-electorale/`)

- `index.vue` : Vue globale
- `nationale/[department].vue` : Détail département
- `diaspora/[country].vue` : Détail pays diaspora

---

## 🧩 Composables

| Composable | Rôle |
|------------|------|
| `useElectoralDashboard()` | Config, élection active, documents |
| `useElectoralCoalitions()` | Liste des coalitions |
| `useElectoralConstituencies()` | Liste des circonscriptions |
| `useElectoralProfessions()` | Stats par profession |
| `useElectoralStatsList()` | Stats départementales |

---

## 📡 APIs

| Endpoint | Description |
|----------|-------------|
| `/api/elections/dashboard/config` | Configuration (années, types, élections) |
| `/api/elections/dashboard/coalitions` | Coalitions |
| `/api/elections/dashboard/constituencies` | Circonscriptions |
| `/api/elections/dashboard/stats/professions` | Stats professions |
| `/api/documents?election_ids=1,2,3` | Documents filtrés par élections |

---

**Auteur** : Vie Publique Sénégal
