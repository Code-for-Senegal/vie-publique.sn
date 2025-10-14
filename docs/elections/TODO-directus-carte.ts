// departements_geo
{
  uuid;
  string; // nom du département
  string; // nom de la région
  json; // polygon GeoJSON du département
}

// donnees_nationales
{
  uuid;
  string;
  string; // correspond au nom dans departements_geo
  string;
  string;
  integer;
  integer;
  string;
}

// donnees_diaspora
{
  uuid;
  string;
  string;
  string;
  string;
  integer;
  integer;
}
