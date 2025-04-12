- region (17 )
- departement (cisconscription)
- commune
- lieux de vote
- bureau de vote (electeurs, implementation)

localisation lieux de vote

- id (UUID) : Identifiant unique.
- name (string) : Nom du lieu de vote agrégé (ex. « Afrique du Sud », « Dakar »).
- type (enum) : Type de localisation (ex. « National » ou « Diaspora »).
- total_voters (integer) : Nombre total d’électeurs pour ce lieu.
- country (string) : Pour la diaspora uniquement.

# Hiérarchie claire :

Région -> Département -> Commune -> Lieu de vote -> Bureau de vote

Utilisation de relations many-to-one (m2o) pour lier les entités

Données géographiques :
Chaque niveau (région, département, commune, lieu de vote) peut avoir des coordonnées
Facilite l'affichage sur une carte

## fonctionalités

- champs de recherche
- listing (region et département)
- carte map
