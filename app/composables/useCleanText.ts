/**
 * Nettoyage de texte issu du CMS pour un usage SAFE dans les meta / JSON-LD.
 *
 * Corrige le bug Google Search Console « Truncated Unicode character » :
 * du texte collé depuis les réseaux sociaux contient souvent des caractères
 * « pseudo-gras » (𝐎𝐛𝐣𝐞𝐭…) du plan astral Unicode (U+1D400+), encodés en
 * UTF-16 sous forme de paires de surrogates (4 octets). Quand Google tronque
 * la longue valeur d'une propriété structurée, la coupure peut tomber au
 * MILIEU d'une paire → surrogate orphelin → structured data invalide.
 *
 * `.normalize('NFKC')` replie ces caractères vers leur équivalent ASCII
 * (𝐎𝐛𝐣𝐞𝐭 → Objet) : plus aucun surrogate → plus rien de tronquable.
 * On décode aussi les entités HTML courantes (stripHtml ne le faisait pas :
 * `&eacute;`, `&rsquo;`… se retrouvaient bruts dans le JSON-LD).
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  euml: 'ë',
  agrave: 'à',
  acirc: 'â',
  aacute: 'á',
  auml: 'ä',
  ocirc: 'ô',
  ograve: 'ò',
  oacute: 'ó',
  ouml: 'ö',
  ugrave: 'ù',
  ucirc: 'û',
  uuml: 'ü',
  icirc: 'î',
  iuml: 'ï',
  ccedil: 'ç',
  ntilde: 'ñ',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  ndash: '–',
  mdash: '—',
  laquo: '«',
  raquo: '»',
  deg: '°',
  euro: '€',
  copy: '©',
  reg: '®',
  trade: '™',
};

const safeFromCodePoint = (cp: number): string => {
  if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return '';
  try {
    return String.fromCodePoint(cp);
  } catch {
    return '';
  }
};

const decodeEntities = (input: string): string =>
  input
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeFromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeFromCodePoint(parseInt(dec, 10)))
    .replace(
      /&([a-z0-9]+);/gi,
      (m, name) => NAMED_ENTITIES[name] ?? NAMED_ENTITIES[name.toLowerCase()] ?? m,
    );

/**
 * Strip HTML → décode les entités → normalise (NFKC, retire les surrogates
 * « exotiques ») → écrase les blancs. À utiliser pour toute valeur de texte
 * CMS injectée dans `useSeoMeta` ou un JSON-LD.
 */
export const cleanCmsText = (html?: string | null): string =>
  decodeEntities((html || '').replace(/<[^>]*>/g, ' '))
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Troncature SÛRE au niveau des code points (jamais au milieu d'une paire de
 * surrogates), avec ellipsis. Défense supplémentaire pour les valeurs longues.
 */
export const truncateText = (text: string, max = 160): string => {
  const cps = Array.from(text);
  if (cps.length <= max) return text;
  return `${cps
    .slice(0, max - 1)
    .join('')
    .trimEnd()}…`;
};

export const useCleanText = () => ({ cleanCmsText, truncateText });
