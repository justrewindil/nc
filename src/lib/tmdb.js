const BASE = 'https://api.themoviedb.org/3';
export const IMG = 'https://image.tmdb.org/t/p';
export const PLAYER_COLOR = 'e50914';

const KEY = import.meta.env.VITE_TMDB_KEY || '';
// v4 Read Access Token is a JWT (contains dots); v3 key is 32 hex chars.
const IS_V4 = KEY.includes('.');

export async function tmdb(path, params = {}) {
  const u = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) u.searchParams.set(k, v);
  }
  let opts;
  if (IS_V4) {
    opts = { headers: { Authorization: `Bearer ${KEY}`, accept: 'application/json' } };
  } else {
    u.searchParams.set('api_key', KEY);
    opts = undefined;
  }
  const r = await fetch(u, opts);
  if (!r.ok) throw new Error(`TMDB ${r.status}`);
  return r.json();
}

const imagesCache = new Map();
export async function getImages(type, id) {
  const key = type + id;
  if (imagesCache.has(key)) return imagesCache.get(key);
  let data = {};
  try { data = await tmdb(`/${type}/${id}/images`, { include_image_language: 'en,null' }); } catch {}
  imagesCache.set(key, data);
  return data;
}

export function pickLogo(images) {
  if (!images || !images.logos) return null;
  return images.logos.find((l) => l.file_path?.endsWith('.png')) || images.logos[0] || null;
}

// ── Streaming sources (VidKing primary) ──
function vkParams(resume = 0) {
  const p = new URLSearchParams({ color: PLAYER_COLOR, autoPlay: 'true' });
  if (resume > 0) p.set('progress', Math.floor(resume));
  return p;
}
export const SOURCES = [
  { name: 'VidKing', url: (id, t, s, e, resume = 0) => {
      const p = vkParams(resume);
      if (t === 'tv') { p.set('nextEpisode', 'true'); p.set('episodeSelector', 'true');
        return `https://www.vidking.net/embed/tv/${id}/${s}/${e}?${p}`; }
      return `https://www.vidking.net/embed/movie/${id}?${p}`;
    } },
  { name: 'Server 2', url: (id, t, s, e) => t === 'tv'
      ? `https://vidsrc.to/embed/tv/${id}/${s}/${e}` : `https://vidsrc.to/embed/movie/${id}` },
  { name: 'Server 3', url: (id, t, s, e) => t === 'tv'
      ? `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` : `https://vidsrc.me/embed/movie?tmdb=${id}` },
  { name: 'Server 4', url: (id, t, s, e) => t === 'tv'
      ? `https://vidlink.pro/tv/${id}/${s}/${e}` : `https://vidlink.pro/movie/${id}` },
  { name: 'Server 5', url: (id, t, s, e) => t === 'tv'
      ? `https://embed.su/embed/tv/${id}/${s}/${e}` : `https://embed.su/embed/movie/${id}` },
];

// ── helpers ──
export const typeOf = (it) => it.media_type || (it.title ? 'movie' : 'tv');
export const titleOf = (it) => it.title || it.name || '';
export const yearOf = (it) => (it.release_date || it.first_air_date || '').split('-')[0];
export function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
}
export function fmtLeft(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
