Architecture de la base de données :
Cette structure permet une organisation hiérarchique flexible et facilite les requêtes pour les filtres et les recherches.

## Table entities:

- id (PK)
- name
- type (enum: 'ministry', 'service', 'public_establishment', 'national_company', 'public_participation_company', 'agency')
- parent_id (FK to entities.id, for hierarchical structure)
- description
- created_at
- updated_at
- logo
- files (fichiers liers)

## Table ministries:

- id (PK)
- entity_id (FK to entities.id)
- full_name
- short_name
- order (for sorting)

## Table supervisory_authorities:

- id (PK)
- name (e.g., 'Présidence de la République', 'Primature', 'Ministère')

## Table entity_supervisory:

- id (PK)
- entity_id (FK to entities.id)
- supervisory_authority_id (FK to supervisory_authorities.id)
