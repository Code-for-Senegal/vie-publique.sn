#!/usr/bin/env node
/**
 * Réindexation Typesense depuis Directus (source de vérité).
 *
 * Contexte : docs/search/audit-recherche-2026-07.md (C2+C5).
 * - Crée la collection cible (schéma v2 : sans locale fr, ids namespacés `<type>-<id>`,
 *   champ `url` précalculé) + les synonymes.
 * - Indexe TOUTES les collections publiques : documents, actualités, dossiers, députés,
 *   questions écrites, votes, personnalités, annuaire de l'État, podcasts.
 * - Idempotent (upsert) : sert aussi de job de RÉCONCILIATION (les imports en masse
 *   Directus ne déclenchent pas les webhooks n8n) — à rejouer après chaque import en
 *   masse ou en cron hebdo.
 *
 * Usage :
 *   node scripts/search-reindex.mjs --create              # crée la collection cible + synonymes
 *   node scripts/search-reindex.mjs                       # réindexe tout (upsert)
 *   node scripts/search-reindex.mjs --only=documents,news # sources choisies
 *   node scripts/search-reindex.mjs --prune               # + supprime les orphelins (docs absents de Directus)
 *   node scripts/search-reindex.mjs --set-alias           # pointe l'alias vp-search sur la cible (opération seule)
 *   node scripts/search-reindex.mjs --target=vpdata_v2    # collection cible (défaut : vpdata_v2)
 *
 * Env requis (lu depuis .env à la racine du repo, ou l'environnement) :
 *   CMS_API_URL, CMS_API_KEY, TYPESENSE_URL, TYPESENSE_ADMIN_API_KEY
 *   (la clé ADMIN, pas la clé search-only de l'app)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}
loadDotEnv();

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([a-z-]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const CMS_URL = (process.env.CMS_API_URL || '').replace(/\/$/, '');
const CMS_KEY = process.env.CMS_API_KEY;
const TS_URL = (process.env.TYPESENSE_URL || '').replace(/\/$/, '');
const TS_KEY = process.env.TYPESENSE_ADMIN_API_KEY;
const TARGET = typeof args.target === 'string' ? args.target : 'vpdata_v2';
const ALIAS = 'vp-search';

if (!CMS_URL || !CMS_KEY || !TS_URL) {
  console.error('❌ CMS_API_URL, CMS_API_KEY et TYPESENSE_URL sont requis (.env).');
  process.exit(1);
}
if (!TS_KEY) {
  console.error(
    '❌ TYPESENSE_ADMIN_API_KEY manquant (.env). La clé ADMIN est requise pour créer/écrire ' +
      "(la clé TYPESENSE_API_KEY de l'app est search-only).",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers HTTP (fetch natif Node 18+, retry simple)
// ---------------------------------------------------------------------------

async function httpJson(url, options = {}, retries = 2) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status} ${url} → ${text.slice(0, 200)}`);
      return text ? JSON.parse(text) : {};
    } catch (err) {
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
}

const cms = (p) =>
  httpJson(`${CMS_URL}${p}`, {
    headers: { Authorization: `Bearer ${CMS_KEY}`, 'User-Agent': 'vpsn-search-reindex' },
  });

const ts = (p, options = {}) =>
  httpJson(`${TS_URL}${p}`, {
    ...options,
    headers: {
      'x-typesense-api-key': TS_KEY,
      'User-Agent': 'vpsn-search-reindex',
      ...(options.headers || {}),
    },
  });

/** Lit toute une collection Directus, paginée. */
async function fetchAll(collection, params) {
  const items = [];
  const limit = 100;
  for (let page = 1; ; page++) {
    const qs = new URLSearchParams({ ...params, limit: String(limit), page: String(page) });
    const { data } = await cms(`/items/${collection}?${qs}`);
    items.push(...data);
    process.stdout.write(`\r   ${collection}: ${items.length} items lus…`);
    if (data.length < limit) break;
  }
  process.stdout.write('\n');
  return items;
}

// ---------------------------------------------------------------------------
// Helpers texte / dates / slugs
// ---------------------------------------------------------------------------

const HTML_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', deg: '°', sup3: '³',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', oelig: 'œ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â',
  ocirc: 'ô', ucirc: 'û', ugrave: 'ù', icirc: 'î', iuml: 'ï', ccedil: 'ç',
  Eacute: 'É', Egrave: 'È', Agrave: 'À', Ccedil: 'Ç', hellip: '…', ndash: '–', mdash: '—',
};

/**
 * Nettoie du HTML CMS pour l'index : strip balises, décode les entités, replie le
 * pseudo-gras Unicode (NFKC — cf. règle SEO §11 CLAUDE.md), collapse les blancs.
 */
function cleanText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => HTML_ENTITIES[name] ?? m)
    .normalize('NFKC')
    .replace(/[’‘]/g, "'") // aligne l'apostrophe typographique sur le token_separator '
    .replace(/\s+/g, ' ')
    .trim();
}

/** Timestamp Unix (secondes). Fallbacks en cascade, jamais null. */
function toEpoch(...dateLikes) {
  for (const d of dateLikes) {
    if (!d) continue;
    const ms = new Date(d).getTime();
    if (Number.isFinite(ms)) return Math.floor(ms / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

/** Slug URL (même logique que AssemblyDeputyCard.vue : lowercase, sans accents, tirets). */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function truncate(text, max = 300) {
  if (!text || text.length <= max) return text || '';
  return [...text].slice(0, max).join('').trimEnd() + '…';
}

const normalizeTags = (tags) =>
  (Array.isArray(tags) ? tags : typeof tags === 'string' && tags ? [tags] : [])
    .map((t) => (typeof t === 'string' ? t : t?.name || t?.title || ''))
    .filter(Boolean);

// ---------------------------------------------------------------------------
// Libellés français des sous-types de documents (facette `category`)
// ---------------------------------------------------------------------------

const DOCUMENT_TYPE_LABELS = {
  official_journal: 'Journal Officiel',
  law: 'Loi',
  decree: 'Décret',
  decision: 'Décision',
  ministerial_order: 'Arrêté ministériel',
  government_bill: 'Projet de loi',
  bill_proposal: 'Proposition de loi',
  code: 'Code',
  audit_report: "Rapport d'audit",
  sectoral_report: 'Rapport sectoriel',
  parliament_report: 'Rapport parlementaire',
  parliamentary_report: 'Rapport parlementaire',
  annual_report: 'Rapport annuel',
  international_report: 'Rapport international',
  commission_report: 'Rapport de commission',
  budget: 'Budget',
  election: 'Élections',
  council_of_ministers: 'Conseil des ministres',
  interministerial_council: 'Conseil interministériel',
  general_policy_statement: 'Déclaration de politique générale',
  parliament_question: 'Question parlementaire',
  legal_opinion: 'Avis juridique',
  press_release: 'Communiqué',
  communique: 'Communiqué',
  public_notice: 'Note au public',
  speech: 'Discours',
  strategy: 'Stratégie',
  circular: 'Circulaire',
  uncategorized: 'Autre',
};

// ---------------------------------------------------------------------------
// Sources : une entrée par collection Directus à indexer
// Mapping type/priority/URL : docs/search/audit-recherche-2026-07.md §C5
// ---------------------------------------------------------------------------

const SOURCES = [
  {
    key: 'documents',
    type: 'document',
    priority: 90,
    collection: 'documents',
    params: {
      'filter[status][_eq]': 'published',
      fields:
        'id,title,description,slug,publish_date,type,cover_image,content_html,tags,date_updated,date_created',
    },
    map: (d) => ({
      title: cleanText(d.title),
      slug: d.slug || slugify(d.title),
      url: `/documents/${d.id}/${d.slug || slugify(d.title)}`,
      summary: truncate(cleanText(d.description)),
      content_text: cleanText(d.content_html),
      category: DOCUMENT_TYPE_LABELS[d.type] || cleanText(d.type) || 'Autre',
      tags: normalizeTags(d.tags),
      cover_image: d.cover_image || '',
      date_published: toEpoch(d.publish_date, d.date_created),
    }),
  },
  {
    key: 'news',
    type: 'news',
    priority: 50,
    collection: 'news',
    params: {
      'filter[status][_eq]': 'published',
      fields:
        'id,title,slug,content,date_published,cover_image,tags,category.name,category.slug,date_created',
    },
    map: (d) => {
      const slug = d.slug || slugify(d.title);
      const catSlug = d.category?.slug;
      let url = `/actualites/${d.id}/${slug}`;
      if (catSlug === 'conseil-des-ministres') url = `/conseil-des-ministres/${d.id}/${slug}`;
      else if (catSlug === 'assemblee-nationale')
        url = `/assemblee-nationale/actualites/${d.id}/${slug}`;
      return {
        title: cleanText(d.title),
        slug,
        url,
        summary: truncate(cleanText(d.content)),
        content_text: cleanText(d.content),
        category: d.category?.name || 'Actualité',
        tags: normalizeTags(d.tags),
        cover_image: d.cover_image || '',
        date_published: toEpoch(d.date_published, d.date_created),
      };
    },
  },
  {
    key: 'dossiers',
    type: 'dossier',
    priority: 80,
    collection: 'dossier',
    params: {
      'filter[status][_eq]': 'published',
      fields:
        'id,title,slug,summary,intro_html,content_html,publish_date,cover_image,tags,type,date_created',
    },
    map: (d) => ({
      title: cleanText(d.title),
      slug: d.slug,
      url: `/dossiers/${d.slug}`,
      summary: truncate(cleanText(d.summary)),
      content_text: cleanText(`${d.intro_html || ''} ${d.content_html || ''}`),
      category: d.type || 'Dossier',
      tags: normalizeTags(d.tags),
      cover_image: d.cover_image || '',
      date_published: toEpoch(d.publish_date, d.date_created),
    }),
  },
  {
    key: 'deputies',
    type: 'depute',
    priority: 70,
    collection: 'assembly_deputy',
    params: {
      'filter[status][_eq]': 'active',
      fields: 'id,first_name,last_name,profession,biography,bio,photo,date_updated,date_created',
    },
    map: (d) => {
      const fullName = `${d.first_name || ''} ${d.last_name || ''}`.trim();
      return {
        title: fullName,
        slug: slugify(`${d.first_name}-${d.last_name}`),
        url: `/assemblee-nationale/deputes/${d.id}/${slugify(`${d.first_name}-${d.last_name}`)}`,
        summary: truncate(cleanText(d.profession)),
        content_text: cleanText(d.biography || d.bio),
        category: 'Député',
        tags: [],
        cover_image: d.photo || '',
        date_published: toEpoch(d.date_updated, d.date_created),
      };
    },
  },
  {
    key: 'questions',
    type: 'question',
    priority: 65,
    collection: 'assembly_question',
    params: {
      'filter[status][_eq]': 'published',
      fields: 'id,subject,question_text,question_date,slug,date_created',
    },
    map: (d) => ({
      title: truncate(cleanText(d.subject), 200),
      slug: d.slug || '',
      url: `/assemblee-nationale/questions/${d.id}`,
      summary: truncate(cleanText(d.subject)),
      content_text: cleanText(d.question_text),
      category: 'Question écrite',
      tags: [],
      cover_image: '',
      date_published: toEpoch(d.question_date, d.date_created),
    }),
  },
  {
    key: 'votes',
    type: 'vote',
    priority: 65,
    collection: 'assembly_vote',
    // pas de filtre : le champ `status` d'un vote = résultat (adopted/rejected), pas la publication
    params: { fields: 'id,name,description,desc,date,type,slug,date_created' },
    map: (d) => ({
      title: cleanText(d.name),
      slug: d.slug || slugify(d.name),
      url: `/assemblee-nationale/votes/${d.id}`,
      summary: truncate(cleanText(d.description)),
      content_text: cleanText(d.desc || d.description),
      category: 'Vote',
      tags: [],
      cover_image: '',
      date_published: toEpoch(d.date, d.date_created),
    }),
  },
  {
    key: 'persons',
    type: 'personnalite',
    priority: 60,
    collection: 'public_persons',
    params: {
      'filter[status][_eq]': 'published',
      fields: 'id,full_name,slug,current_appointment,short_bio,long_bio,photo,date_updated,date_created',
    },
    map: (d) => ({
      title: cleanText(d.full_name),
      slug: d.slug || slugify(d.full_name),
      url: `/personnalites/${d.id}/${d.slug || slugify(d.full_name)}`,
      summary: truncate(cleanText(d.current_appointment || d.short_bio)),
      content_text: cleanText(d.long_bio || d.short_bio),
      category: 'Personnalité',
      tags: [],
      cover_image: d.photo || '',
      date_published: toEpoch(d.date_updated, d.date_created),
    }),
  },
  {
    key: 'annuaire',
    type: 'institution',
    priority: 60,
    collection: 'state_organization_entity',
    // pas de champ status sur cette collection
    params: { fields: 'id,name,slug,description,body,logo,cover_image,date_updated,date_created' },
    map: (d) => ({
      title: cleanText(d.name),
      slug: d.slug,
      url: `/etat-senegal/annuaire/${d.slug}`,
      summary: truncate(cleanText(d.description)),
      content_text: cleanText(d.body || d.description),
      category: "Annuaire de l'État",
      tags: [],
      cover_image: d.cover_image || d.logo || '',
      date_published: toEpoch(d.date_updated, d.date_created),
    }),
  },
  {
    key: 'podcasts',
    type: 'podcast',
    priority: 40,
    collection: 'vp_podcasts',
    params: {
      'filter[status][_eq]': 'published',
      fields: 'id,title,slug,description,date_published,cover_image,tags,date_created',
    },
    map: (d) => ({
      title: cleanText(d.title),
      slug: d.slug || slugify(d.title),
      url: `/podcasts/${d.id}/${d.slug || slugify(d.title)}`,
      summary: truncate(cleanText(d.description)),
      content_text: cleanText(d.description),
      category: 'Podcast',
      tags: normalizeTags(d.tags),
      cover_image: d.cover_image || '',
      date_published: toEpoch(d.date_published, d.date_created),
    }),
  },
];

// ---------------------------------------------------------------------------
// Schéma v2 + synonymes (référence : audit-recherche-2026-07.md §C2/C6)
// ---------------------------------------------------------------------------

const SCHEMA = {
  name: TARGET,
  default_sorting_field: 'date_published',
  // Typesense n'accepte que des symboles ASCII ici ; l'apostrophe typographique ’ est
  // normalisée en ' par cleanText() à l'indexation.
  token_separators: ['-', "'"],
  fields: [
    { name: 'source_id', type: 'string', index: false, optional: true },
    { name: 'url', type: 'string', index: false, optional: true },
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'string', index: false, optional: true },
    { name: 'content_text', type: 'string', optional: true },
    { name: 'summary', type: 'string', optional: true },
    { name: 'date_published', type: 'int64', facet: true, sort: true },
    { name: 'cover_image', type: 'string', index: false, optional: true },
    { name: 'tags', type: 'string[]', facet: true, optional: true },
    { name: 'category', type: 'string', facet: true, optional: true },
    { name: 'type', type: 'string', facet: true },
    { name: 'priority', type: 'int32', sort: true, optional: true },
  ],
};

const SYNONYMS = {
  'jo-journal-officiel': ['jo', 'journal officiel'],
  'assemblee-parlement': ['assemblée nationale', 'parlement', 'hémicycle'],
  'budget-loi-finances': ['budget', 'loi de finances'],
  lfr: ['lfr', 'loi de finances rectificative'],
  'pm-premier-ministre': ['pm', 'premier ministre'],
  'president-chef-etat': ['président de la république', "chef de l'état"],
  'depute-parlementaire': ['député', 'parlementaire'],
  'code-route': ['code de la route', 'code routier'],
  dpg: ['dpg', 'déclaration de politique générale'],
  cese: ['cese', 'conseil économique social et environnemental'],
  ofnac: ['ofnac', 'office national de lutte contre la fraude et la corruption'],
};

// ---------------------------------------------------------------------------
// Opérations
// ---------------------------------------------------------------------------

async function createCollection() {
  const existing = await ts('/collections').then((c) => c.map((x) => x.name));
  if (existing.includes(TARGET)) {
    if (!args.drop) {
      console.log(`ℹ️  Collection ${TARGET} existe déjà (utiliser --drop pour la recréer).`);
      return;
    }
    console.log(`🗑  Suppression de ${TARGET}…`);
    await ts(`/collections/${TARGET}`, { method: 'DELETE' });
  }
  await ts('/collections', { method: 'POST', body: JSON.stringify(SCHEMA) });
  console.log(`✅ Collection ${TARGET} créée (sans locale fr, token_separators, ids namespacés).`);
  for (const [id, synonyms] of Object.entries(SYNONYMS)) {
    await ts(`/collections/${TARGET}/synonyms/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ synonyms }),
    });
  }
  console.log(`✅ ${Object.keys(SYNONYMS).length} synonymes créés sur ${TARGET}.`);
}

async function importDocs(docs) {
  let ok = 0;
  const errors = [];
  for (let i = 0; i < docs.length; i += 500) {
    const batch = docs.slice(i, i + 500);
    const res = await fetch(
      `${TS_URL}/collections/${TARGET}/documents/import?action=upsert`,
      {
        method: 'POST',
        headers: { 'x-typesense-api-key': TS_KEY, 'Content-Type': 'text/plain' },
        body: batch.map((d) => JSON.stringify(d)).join('\n'),
      },
    );
    const lines = (await res.text()).trim().split('\n');
    lines.forEach((line, j) => {
      const r = JSON.parse(line);
      if (r.success) ok++;
      else errors.push({ id: batch[j].id, error: r.error });
    });
  }
  return { ok, errors };
}

async function syncSource(source) {
  console.log(`\n📥 ${source.key} (Directus: ${source.collection} → type: ${source.type})`);
  const items = await fetchAll(source.collection, source.params);
  const docs = items
    .map((item) => {
      const mapped = source.map(item);
      if (!mapped.title) return null; // pas de titre = pas cherchable
      return {
        id: `${source.type}-${item.id}`,
        source_id: String(item.id),
        type: source.type,
        priority: source.priority,
        ...mapped,
      };
    })
    .filter(Boolean);
  const { ok, errors } = await importDocs(docs);
  console.log(`   ✅ ${ok}/${docs.length} indexés${errors.length ? ` — ⚠️ ${errors.length} erreurs` : ''}`);
  errors.slice(0, 3).forEach((e) => console.log(`      ⚠️ id=${e.id}: ${e.error}`));
  return { ids: new Set(docs.map((d) => d.id)), ok, errors: errors.length };
}

async function pruneSource(source, freshIds) {
  const qs = new URLSearchParams({ filter_by: `type:=${source.type}`, include_fields: 'id' });
  const res = await fetch(`${TS_URL}/collections/${TARGET}/documents/export?${qs}`, {
    headers: { 'x-typesense-api-key': TS_KEY },
  });
  const indexed = (await res.text())
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l).id);
  const orphans = indexed.filter((id) => !freshIds.has(id));
  for (let i = 0; i < orphans.length; i += 150) {
    const chunk = orphans.slice(i, i + 150);
    await ts(
      `/collections/${TARGET}/documents?filter_by=${encodeURIComponent(`id:[${chunk.join(',')}]`)}`,
      { method: 'DELETE' },
    );
  }
  if (orphans.length) console.log(`   🗑  ${orphans.length} orphelins supprimés (${source.type})`);
}

async function setAlias() {
  await ts(`/aliases/${ALIAS}`, {
    method: 'PUT',
    body: JSON.stringify({ collection_name: TARGET }),
  });
  console.log(`✅ Alias ${ALIAS} → ${TARGET}`);
}

async function report() {
  const qs = new URLSearchParams({
    q: '*',
    query_by: 'title',
    facet_by: 'type',
    per_page: '0',
    max_facet_values: '20',
  });
  const res = await ts(`/collections/${TARGET}/documents/search?${qs}`);
  console.log(`\n📊 État de ${TARGET} : ${res.found} documents`);
  res.facet_counts?.[0]?.counts?.forEach((c) => console.log(`   ${c.value}: ${c.count}`));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const only = typeof args.only === 'string' ? args.only.split(',').map((s) => s.trim()) : null;

console.log(`🎯 Cible : ${TS_URL}/collections/${TARGET}`);

if (args.create) await createCollection();

if (args['set-alias']) {
  // --set-alias : opération seule (pointer l'alias), pas de synchronisation
  await setAlias();
  process.exit(0);
}

const sources = SOURCES.filter((s) => !only || only.includes(s.key));
if (only && sources.length !== only.length) {
  const known = SOURCES.map((s) => s.key).join(', ');
  console.error(`❌ Source inconnue dans --only. Sources : ${known}`);
  process.exit(1);
}

if (sources.length > 0 && !args.create && !args['set-alias']) {
  // vérifier que la cible existe avant de synchroniser
  const collections = await ts('/collections').then((c) => c.map((x) => x.name));
  if (!collections.includes(TARGET)) {
    console.error(`❌ La collection ${TARGET} n'existe pas. Lancer d'abord avec --create.`);
    process.exit(1);
  }
}

let totalErrors = 0;
for (const source of sources) {
  const { ids, errors } = await syncSource(source);
  totalErrors += errors;
  if (args.prune) await pruneSource(source, ids);
}

await report();

if (totalErrors > 0) {
  console.log(`\n⚠️  Terminé avec ${totalErrors} erreurs d'import.`);
  process.exit(2);
}
console.log('\n✅ Réindexation terminée.');
