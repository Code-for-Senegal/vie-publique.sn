CREATE TABLE elections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- ex: legislative "Législatives", "Présidentielles", etc. presidential
    start_date DATE,
    end_date DATE,
    election_status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
    -- Ajoutez les champs par défaut de Directus
);

-- Constituencies table
CREATE TABLE constituencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL, -- 'department' or 'diaspora'
    majority_seats INT NOT NULL
);

-- Parties/coalitions table
CREATE TABLE coalitions  (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    acronym VARCHAR(20),
    logo_url VARCHAR(255),
        list_order INT UNIQUE NOT NULL
        type VARCHAR(50) NOT NULL, -- ex: coalition, party
);

-- Electoral lists table
CREATE TABLE electoral_lists (
    id SERIAL PRIMARY KEY,
    party_id INT REFERENCES coalitions(id),
    constituency_id INT REFERENCES constituencies(id),
    type VARCHAR(20) NOT NULL, -- 'national' or 'departmental'
    UNIQUE (party_id, constituency_id, type)
);

-- Candidates table
CREATE TABLE candidates (
    id SERIAL PRIMARY KEY,
    list_id INT REFERENCES electoral_lists(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    voter_id VARCHAR(20) UNIQUE NOT NULL,
    gender CHAR(1) NOT NULL,
    profession VARCHAR(100) NOT NULL,
    list_position INT NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'titular' or 'substitute'
    photo_url VARCHAR(255),
    biography TEXT,
    birth_date DATE,
    incumbent BOOLEAN DEFAULT FALSE,
    facebook_url VARCHAR(255),
    twitter_url VARCHAR(255),
    instagram_url VARCHAR(255),
    UNIQUE (list_id, list_position, type)
);

-- Constituency results table
CREATE TABLE constituency_results (
    constituency_id INT REFERENCES constituencies(id),
    list_id INT REFERENCES electoral_lists(id),
    votes INT NOT NULL,
    seats_won INT NOT NULL,
    PRIMARY KEY (constituency_id, list_id)
);

-- National results table (for proportional representation)
CREATE TABLE national_results (
    party_id INT REFERENCES coalitions(id) PRIMARY KEY,
    total_votes INT NOT NULL,
    proportional_seats INT NOT NULL
);

-- Elected deputies table
CREATE TABLE elected_deputies (
    candidate_id INT REFERENCES candidates(id) PRIMARY KEY,
    election_type VARCHAR(20) NOT NULL, -- 'majority' or 'proportional'
    constituency_id INT REFERENCES constituencies(id)
);

-- Indexes for optimizing frequent queries
CREATE INDEX idx_candidates_list ON candidates(list_id);
CREATE INDEX idx_electoral_lists_party ON electoral_lists(party_id);
CREATE INDEX idx_electoral_lists_constituency ON electoral_lists(constituency_id);