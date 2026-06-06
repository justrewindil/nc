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

// build a pack: 5 distinct actors from a title, each as a role card tied to that title
export function buildPack(cast, mediaId, mediaTitle, size = PACK_SIZE) {
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
      actorId: c.id,
      name: c.name,
      character: c.character || '',
      profile: c.profile_path || '',
      rarity: rarityFor(c.popularity, c.order),
      mediaId,
      mediaTitle: mediaTitle || '',
    });
  }
  return picked;
}
