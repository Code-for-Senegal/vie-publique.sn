-- Table des élections
CREATE TABLE elections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    type VARCHAR(50) NOT NULL -- 'Présidentielle', 'Législative', 'Municipale', 'Départementale'
    status VARCHAR(20) DEFAULT 'upcoming' -- 'upcoming', 'ongoing', 'completed'
);

-- Table des partis/coalitions
CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    acronym VARCHAR(20),
    type VARCHAR(50) NOT NULL -- 'Coalition', 'Parti', 'Entité indépendante'
    logo VARCHAR(255)
);

-- Table des circonscriptions
CREATE TABLE constituencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL -- 'Département', 'Diaspora'
);

-- Table des listes électorales
CREATE TABLE electoral_lists (
    id SERIAL PRIMARY KEY,
    election_id INT REFERENCES elections(id),
    party_id INT REFERENCES parties(id),
    constituency_id INT REFERENCES constituencies(id), -- NULL pour liste nationale
    type VARCHAR(20) NOT NULL, -- 'Nationale', 'Départementale'
    UNIQUE (election_id, party_id, constituency_id)
);

-- Table des candidats
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    list_id INT REFERENCES electoral_lists(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    voter_id VARCHAR(20) UNIQUE NOT NULL,
    gender CHAR(1) NOT NULL,
    profession VARCHAR(100),
    position INT NOT NULL, -- Ordre d'investiture
    type VARCHAR(20) NOT NULL, -- 'Titulaire', 'Suppléant'
    is_elected BOOLEAN DEFAULT FALSE
);

-- Index pour optimiser les performances
CREATE INDEX idx_electoral_lists_election ON electoral_lists(election_id);
CREATE INDEX idx_electoral_lists_party ON electoral_lists(party_id);
CREATE INDEX idx_candidates_list ON candidates(list_id);


-- Cette structure simplifiée permet de :

-- Gérer différents types d'élections.
-- Associer des partis/coalitions à des élections via les listes électorales.
-- Distinguer les listes nationales et départementales.
-- Gérer les candidats titulaires et suppléants avec leur ordre d'investiture.
-- Indiquer si un candidat est élu ou non.