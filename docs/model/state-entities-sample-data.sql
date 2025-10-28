-- Exemple de données pour la collection state_entities
-- Ces données sont des exemples basés sur l'organisation réelle de l'État du Sénégal

-- Ministères (niveau 1)
INSERT INTO state_entities (public_slug, name, short_name, acronym, type, status, description, mission, director_name, director_title, website, created_at, decree_number, decree_date) VALUES
('ministere-sante-action-sociale', 'Ministère de la Santé et de l''Action sociale', 'Ministère de la Santé', 'MSAS', 'ministere', 'active', 'Ministère en charge de la santé publique et de l''action sociale', 'Élaborer et mettre en œuvre la politique de santé publique et d''action sociale', 'Dr. Ibrahima Sy', 'Ministre', 'http://www.sante.gouv.sn', '2024-04-05', 'Décret n° 2024-940', '2024-04-05'),

('ministere-economie-plan', 'Ministère de l''Économie, du Plan et de la Coopération', 'Ministère de l''Économie', 'MEPFC', 'ministere', 'active', 'Ministère en charge de l''économie, du plan et de la coopération', 'Concevoir et coordonner la politique économique et financière', 'Abdourahmane Sarr', 'Ministre', 'http://www.economie.gouv.sn', '2024-04-05', 'Décret n° 2024-940', '2024-04-05'),

('ministere-interieur-securite', 'Ministère de l''Intérieur et de la Sécurité publique', 'Ministère de l''Intérieur', 'MISP', 'ministere', 'active', 'Ministère en charge de la sécurité intérieure et de l''administration du territoire', 'Assurer la sécurité des personnes et des biens sur l''ensemble du territoire national', 'Jean-Baptiste Tine', 'Ministre', 'http://www.interieur.gouv.sn', '2024-04-05', 'Décret n° 2024-940', '2024-04-05'),

('ministere-education-nationale', 'Ministère de l''Éducation nationale', 'Ministère de l''Éducation', 'MEN', 'ministere', 'active', 'Ministère en charge de l''éducation de base et secondaire', 'Définir et mettre en œuvre la politique éducative nationale', 'Moustapha Mamba Guirassy', 'Ministre', 'http://www.education.gouv.sn', '2024-04-05', 'Décret n° 2024-940', '2024-04-05');

-- Directions rattachées au Ministère de la Santé
INSERT INTO state_entities (public_slug, name, short_name, acronym, type, status, description, parent_entity, director_name, director_title, phone, created_at) VALUES
('direction-prevention', 'Direction de la Prévention', 'DP', 'DP', 'direction', 'active', 'Direction en charge de la prévention des maladies', (SELECT id FROM state_entities WHERE public_slug = 'ministere-sante-action-sociale'), 'Dr. Mamadou Ndiaye', 'Directeur', '+221 33 821 92 27', '2024-04-05'),

('direction-etablissements-sante', 'Direction des Établissements de Santé', 'DES', 'DES', 'direction', 'active', 'Direction en charge de la gestion des établissements de santé', (SELECT id FROM state_entities WHERE public_slug = 'ministere-sante-action-sociale'), 'Dr. Aminata Diallo', 'Directrice', '+221 33 889 45 67', '2024-04-05'),

('direction-pharmacie-medicaments', 'Direction de la Pharmacie et du Médicament', 'DPM', 'DPM', 'direction', 'active', 'Direction en charge de la régulation des médicaments', (SELECT id FROM state_entities WHERE public_slug = 'ministere-sante-action-sociale'), 'Pr. Babacar Faye', 'Directeur', '+221 33 825 78 90', '2024-04-05');

-- Agences rattachées au Ministère de la Santé
INSERT INTO state_entities (public_slug, name, short_name, acronym, type, status, description, mission, parent_entity, director_name, director_title, address, phone, email, website, created_at, decree_number) VALUES
('agence-couverture-maladie-universelle', 'Agence de la Couverture Maladie Universelle', 'Agence CMU', 'CMU', 'agence', 'active', 'Agence en charge de la mise en œuvre de la couverture maladie universelle', 'Assurer une couverture santé pour tous les Sénégalais', (SELECT id FROM state_entities WHERE public_slug = 'ministere-sante-action-sociale'), 'Dr. Bocar Mamadou Daff', 'Directeur général', 'Route de Ouakam, Dakar', '+221 33 859 63 00', 'contact@cmu.sn', 'http://www.cmu.sn', '2013-07-01', 'Décret n° 2013-1188');

-- Directions rattachées au Ministère de l'Économie
INSERT INTO state_entities (public_slug, name, short_name, acronym, type, status, description, parent_entity, director_name, director_title, created_at) VALUES
('direction-prevision-etudes-economiques', 'Direction de la Prévision et des Études Économiques', 'DPEE', 'DPEE', 'direction', 'active', 'Direction en charge des prévisions économiques', (SELECT id FROM state_entities WHERE public_slug = 'ministere-economie-plan'), 'Amadou Diaw', 'Directeur', '2024-04-05'),

('direction-budget', 'Direction du Budget', 'DB', 'DB', 'direction', 'active', 'Direction en charge de la préparation et de l''exécution du budget', (SELECT id FROM state_entities WHERE public_slug = 'ministere-economie-plan'), 'Moussa Cissé', 'Directeur', '2024-04-05');

-- Agences rattachées au Ministère de l'Économie
INSERT INTO state_entities (public_slug, name, short_name, acronym, type, status, description, mission, parent_entity, director_name, director_title, address, phone, email, website, created_at) VALUES
('ansd', 'Agence Nationale de la Statistique et de la Démographie', 'ANSD', 'ANSD', 'agence', 'active', 'Agence en charge de la production des statistiques officielles', 'Produire et diffuser des statistiques officielles fiables', (SELECT id FROM state_entities WHERE public_slug = 'ministere-economie-plan'), 'Aboubacar Sédikh Bèye', 'Directeur général', 'Rocade Fann Bel-Air Cerf-Volant, Dakar', '+221 33 869 21 39', 'ansd@ansd.sn', 'http://www.ansd.sn', '2006-01-01'),

('apix', 'Agence pour la Promotion des Investissements et Grands Travaux', 'APIX', 'APIX', 'agence', 'active', 'Agence en charge de la promotion des investissements', 'Promouvoir les investissements privés au Sénégal', (SELECT id FROM state_entities WHERE public_slug = 'ministere-economie-plan'), 'Mountaga Sy', 'Directeur général', '52-54, Rue Mohamed V, Dakar', '+221 33 849 05 55', 'courrier@apix.sn', 'http://www.investinsenegal.com', '2000-01-01');

-- Autorités indépendantes (pas de parent_entity)
INSERT INTO state_entities (public_slug, name, short_name, acronym, type, status, description, mission, director_name, director_title, address, phone, email, website, created_at, decree_number) VALUES
('artp', 'Autorité de Régulation des Télécommunications et des Postes', 'ARTP', 'ARTP', 'autorite', 'active', 'Autorité indépendante de régulation des télécoms et postes', 'Réguler le secteur des télécommunications et des postes', 'Dahirou Thiam', 'Directeur général', 'Liberté 6 Extension, Dakar', '+221 33 859 66 89', 'contact@artp.sn', 'http://www.artp.sn', '2002-01-01', 'Loi n° 2018-27'),

('cnra', 'Conseil National de Régulation de l''Audiovisuel', 'CNRA', 'CNRA', 'autorite', 'active', 'Autorité de régulation de l''audiovisuel', 'Garantir la liberté et le pluralisme dans l''audiovisuel', 'Mamadou Oumar Ndiaye', 'Président', 'VDN, Dakar', '+221 33 864 10 60', 'cnra@cnra.sn', 'http://www.cnra.sn', '2006-01-01', 'Loi n° 2006-04');

-- Sociétés nationales
INSERT INTO state_entities (public_slug, name, short_name, acronym, type, status, description, mission, director_name, director_title, address, phone, website, created_at) VALUES
('senelec', 'Société Nationale d''Électricité du Sénégal', 'SENELEC', 'SENELEC', 'societe_nationale', 'active', 'Société nationale en charge de la production et distribution d''électricité', 'Assurer la fourniture d''électricité sur l''ensemble du territoire', 'Papa Mademba Biteye', 'Directeur général', 'Rue Vincens, Dakar', '+221 33 839 32 00', 'http://www.senelec.sn', '1983-01-01'),

('sen-eau', 'Sénégalaise des Eaux', 'SEN''EAU', 'SDE', 'societe_nationale', 'active', 'Société en charge de la distribution d''eau potable', 'Assurer la distribution d''eau potable en zone urbaine', 'Charles Fall', 'Directeur général', 'Avenue Malick Sy, Dakar', '+221 800 00 11 11', 'http://www.sen-eau.sn', '1996-01-01');

-- Événements historiques
INSERT INTO state_entity_events (entity_id, event_type, event_date, description, decree_number, legal_reference) VALUES
((SELECT id FROM state_entities WHERE public_slug = 'ministere-sante-action-sociale'), 'created', '2024-04-05', 'Création du Ministère de la Santé et de l''Action sociale suite à la réorganisation gouvernementale', 'Décret n° 2024-940', 'Décret n° 2024-940 du 05 avril 2024'),

((SELECT id FROM state_entities WHERE public_slug = 'agence-couverture-maladie-universelle'), 'created', '2013-07-01', 'Création de l''Agence de la Couverture Maladie Universelle', 'Décret n° 2013-1188', 'Loi n° 2013-10 du 28 décembre 2013'),

((SELECT id FROM state_entities WHERE public_slug = 'ansd'), 'created', '2006-01-01', 'Création de l''Agence Nationale de la Statistique et de la Démographie par fusion de la Direction de la Prévision et de la Statistique (DPS)', 'Décret n° 2006-755', 'Décret n° 2006-755 du 21 juillet 2006');

-- Notes:
-- 1. Remplacer les dates et noms par les données officielles réelles
-- 2. Ajouter les relations hiérarchiques complètes
-- 3. Vérifier les numéros de décrets officiels
-- 4. Compléter avec toutes les entités du décret 2024-940
