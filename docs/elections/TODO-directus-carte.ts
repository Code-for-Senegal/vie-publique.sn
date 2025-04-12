// departements_geo
{
  id: uuid;
  nom: string; // nom du département
  region: string; // nom de la région
  geometry: json; // polygon GeoJSON du département
}

// donnees_nationales
{
  id: uuid;
  region: string;
  departement: string; // correspond au nom dans departements_geo
  commune: string;
  lieu_vote: string;
  bureau: integer;
  electeurs: integer;
  implantation: string;
}

// donnees_diaspora
{
  id: uuid;
  representation_diplomatique: string;
  pays: string;
  localite: string;
  lieu_vote: string;
  numero_bureau: integer;
  electeurs: integer;
}
