// Collectible card-game economy constants + pure helpers.

export const PACK_COST = 100;              // coins to open a pack
export const PACK_SIZE = 5;                // cards per pack
export const COINS_PER_MIN = 5;            // coins earned per minute watched
export const DAILY_EARN_CAP = 600;         // max coins earnable per day from watching

// rarity by TMDB actor popularity
export const RARITIES = {
  legendary: { label: 'Legendary', color: '#f5c518', shard: 120, weight: 1 },
  epic:      { label: 'Epic',      color: '#a855f7', shard: 40,  weight: 2 },
  rare:      { label: 'Rare',      color: '#3b82f6', shard: 15,  weight: 3 },
  common:    { label: 'Common',    color: '#9aa0aa', shard: 5,   weight: 4 },
};
export const RARITY_ORDER = ['legendary', 'epic', 'rare', 'common'];

export function rarityOf(popularity = 0) {
  if (popularity >= 20) return 'legendary';
  if (popularity >= 10) return 'epic';
  if (popularity >= 4) return 'rare';
  return 'common';
}

// pick N distinct random cast members and turn them into card defs
export function buildPack(cast, size = PACK_SIZE) {
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
      actorId: c.id,
      name: c.name,
      profile: c.profile_path || '',
      rarity: rarityOf(c.popularity),
    });
  }
  return picked;
}
