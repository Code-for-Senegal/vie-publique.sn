1. Objectif

Créer un dashboard électoral unifié, capable de décliner chaque scrutin (présidentiel / législatives / locales) avec :
- Avant : 
  candidats/listes, parrainages ou dépôt (si applicable), carte électorale, guide de vote, contexte légal.
  Pendant / J-J : 
  suivi de la remontée des PV / consolidation (si vous avez la donnée).
- Après : 
  résultats officiels, visualisations, répartition des sièges, annuaire des élus, exports.
2. Périmètre fonctionnel (cible)
  A. Gestion multi-élections (socle)
    Fiche “Élection” : type, date(s), tour(s), périmètre (national/diaspora/collectivités), règles de calcul/répartition, sources officielles, versioning.
    Pages génériques réutilisables quel que soit le scrutin :
    Candidats / Listes
    Carte électorale (lieux/bureaux/électeurs)
    Résultats
    Statistiques
    Annuaire des élus
    Guide de vote
    Alignement “code électoral” : prise en compte des notions structurantes de la donnée électorale (carte d’électeur, listes, bureaux de vote, dépouillement, bulletins, votes valables/blancs/nuls, etc.).
  C. Après scrutin (résultats & analyses)
    Résultats officiels
    Classement des listes/candidats + pourcentages/voix, filtres par zone. vie-publique.sn
    Carte des résultats (choroplèthe + drill-down).
    Répartition des sièges
    Vue hémicycle + détail par coalition/liste et par circonscription quand applicable. vie-publique.sn+1
    Annuaire des élus
    Pages élus + rattachement (liste/coalition, département/collectivité), et stats (profil, métier, etc.). vie-publique.sn
    Exports
    CSV/JSON par niveau (national, région, département/commune, diaspora) + téléchargement “source data”.
3. Données & modèle (minimum viable)
  - Référentiels
      Référentiel géographique (stable) : pays (diaspora), régions, départements, arrondissements, communes, localités.
      Référentiel électoral : lieux de vote, bureaux de vote, électeurs inscrits (par zone), bureaux rattachés.
  - Entités métier
      Election
      Circonscription (varie selon scrutin : national / département / commune / diaspora)
      Liste/Coalition (ou Candidat unique pour présidentiel)
      Candidat (profil, photo, rôle : titulaire/suppléant si applicable)
      Résultat (niveau d’agrégation : bureau → lieu → commune → département → national/diaspora)
      PV / Source (document, lien, date de publication, statut)
      Champs résultats (standard)
      Inscrits, votants, suffrages exprimés
      Voix par liste/candidat
      Votes blancs, votes nuls (et idéalement “non valables” si source le fournit)

5. UX/UI (réutilisable, simple)
  Navigation : 
  Élections → choisir un scrutin et une année → onglets standard (Candidats, Carte, Résultats, Stats, Guide, Sources).
  Par défaut affichage du dernier scrutin à date
  Drill-down systématique : 
  National → Région/Département → Commune (selon scrutin) → Lieu → Bureau.
  Recherche globale : 
  liste/coalition, candidat, localité, bureau.
  “Sources” visibles partout (liens docs + note méthodo).
