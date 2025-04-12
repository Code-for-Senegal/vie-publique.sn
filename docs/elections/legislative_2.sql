
-- Table des élections
CREATE TABLE elections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Législatives', 'Présidentielles', etc.
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'upcoming' -- 'upcoming', 'ongoing', 'completed'
);

-- Table des partis/coalitions
CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    acronym VARCHAR(20),
    logo VARCHAR(255)
);

-- Table des circonscriptions
CREATE TABLE constituencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'department', 'national', 'diaspora'
    seats INT NOT NULL -- Nombre de sièges à pourvoir
);

-- Table de jonction élections-partis
CREATE TABLE election_parties (
    id SERIAL PRIMARY KEY,
    election_id INT REFERENCES elections(id),
    party_id INT REFERENCES parties(id),
    list_order INT NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'withdrawn', 'disqualified'
    UNIQUE(election_id, party_id),
    UNIQUE(election_id, list_order)
);


-- Table des personnes (candidats potentiels)
CREATE TABLE persons (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender CHAR(1),
    photo_url VARCHAR(255),
    biography TEXT
);

-- Table des candidatures
CREATE TABLE candidacies (
    id SERIAL PRIMARY KEY,
    person_id INT REFERENCES persons(id),
    election_party_id INT REFERENCES election_parties(id),
    constituency_id INT REFERENCES constituencies(id),
    list_position INT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'titular', 'substitute'
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'withdrawn', 'disqualified'
);

-- Table des mandats de député
CREATE TABLE deputy_terms (
    id SERIAL PRIMARY KEY,
    person_id INT REFERENCES persons(id),
    election_id INT REFERENCES elections(id),
    candidacy_id INT REFERENCES candidacies(id),
    constituency_id INT REFERENCES constituencies(id),
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'completed', 'resigned'
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_election_parties_election ON election_parties(election_id);
CREATE INDEX idx_candidacies_election_party ON candidacies(election_party_id);
CREATE INDEX idx_candidacies_constituency ON candidacies(constituency_id);
CREATE INDEX idx_deputy_terms_person ON deputy_terms(person_id);
CREATE INDEX idx_deputy_terms_election ON deputy_terms(election_id);
