// Collectible card-game economy constants + pure helpers.
// A "card" represents an actor IN A ROLE from a specific title — so one actor
// can have many different cards (e.g. Tom Holland as Spider-Man, as Nathan Drake…).
// Lead roles are rarer than minor ones.

export const PACK_COST = 100;              // coins to open a pack
export const PACK_SIZE = 5;                // cards per pack
export const COINS_PER_MIN = 5;            // coins earned per minute watched
export const DAILY_EARN_CAP = 600;         // max coins earnable per day from watching

export const RARITIES = {
  legendary: { label: 'Legendary', color: '#f5c518', shard: 120 },
  epic:      { label: 'Epic',      color: '#a855f7', shard: 40 },
  rare:      { label: 'Rare',      color: '#3b82f6', shard: 15 },
  common:    { label: 'Common',    color: '#9aa0aa', shard: 5 },
};
export const RARITY_ORDER = ['legendary', 'epic', 'rare', 'common'];
const TIERS = ['common', 'rare', 'epic', 'legendary']; // low → high

// rarity from actor popularity, boosted by billing order (leads are rarer)
export function rarityFor(popularity = 0, order = 99) {
  let idx = popularity >= 20 ? 3 : popularity >= 10 ? 2 : popularity >= 4 ? 1 : 0;
  if (order === 0) idx += 2;        // top-billed (the title character) → big boost
  else if (order <= 2) idx += 1;    // main cast → boost
  return TIERS[Math.min(3, idx)];
}

// rarity for a "moment" card from its rating (high-rated episodes = rarer moments)
export function rarityForVote(v = 0) {
  return v >= 8.5 ? 'legendary' : v >= 8 ? 'epic' : v >= 7 ? 'rare' : 'common';
}
// rarity by rank (best scene first → rarest)
export function rarityByRank(i) {
  return i === 0 ? 'legendary' : i <= 2 ? 'epic' : i <= 5 ? 'rare' : 'common';
}
export function shuffle(a) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}

// compute the rarity odds for a title's card pool (the cast buildPack draws from)
export function poolOdds(cast) {
  const pool = (cast || []).filter((c) => c.id && c.name).slice(0, 20);
  const counts = { legendary: 0, epic: 0, rare: 0, common: 0 };
  pool.forEach((c) => { counts[rarityFor(c.popularity, c.order)]++; });
  const total = pool.length || 1;
  const rows = RARITY_ORDER.map((r) => ({ rarity: r, count: counts[r], pct: Math.round((counts[r] / total) * 100) }));
  // full list of possible cards (with images), sorted rarest first
  const list = pool
    .map((c) => ({ actorId: c.id, name: c.name, character: c.character || '', profile: c.profile_path || '', rarity: rarityFor(c.popularity, c.order) }))
    .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
  return { rows, total, list };
}

// build a pack: 5 distinct actors from a title, each as a role card tied to that title
export function buildPack(cast, mediaId, mediaTitle, mediaType = 'movie', scene = '', size = PACK_SIZE) {
  const pool = (cast || []).filter((c) => c.id && c.name).slice(0, 20);
  const picked = [];
  const used = new Set();
  let guard = 0;
  while (picked.length < Math.min(size, pool.length) && guard < 200) {
    guard++;
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (used.has(c.id)) continue;
    used.add(c.id);
    picked.push({
      key: `${c.id}-${mediaId}`,                 // actor + this title = one collectible role card
      kind: 'role',
      actorId: c.id,
      name: c.name,
      character: c.character || '',
      profile: c.profile_path || '',
      rarity: rarityFor(c.popularity, c.order),
      mediaId,
      mediaTitle: mediaTitle || '',
      mediaType,
      scene: scene || '',
    });
  }
  return picked;
}
