// Supabase data access for cross-device sync.
// All functions no-op / return null when Supabase isn't configured, so the app
// keeps working on localStorage alone.
import { supabase, isSupabaseReady } from './supabase';

const ratingKey = (id, type) => `${type}-${id}`;

export async function fetchLibrary(uid) {
  if (!isSupabaseReady || !uid) return null;
  const { data, error } = await supabase.from('library').select('*').eq('user_id', uid);
  if (error) return null; // table missing → caller falls back to localStorage
  const watchlist = [], favorites = [];
  for (const r of data) {
    const item = { id: r.media_id, type: r.media_type, title: r.title, poster: r.poster || '' };
    if (r.kind === 'favorite') favorites.push(item); else watchlist.push(item);
  }
  return { watchlist, favorites };
}
export async function upsertLibrary(uid, item, kind) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('library').upsert({
    user_id: uid, media_id: item.id, media_type: item.type, kind,
    title: item.title || '', poster: item.poster || '',
  }, { onConflict: 'user_id,media_id,media_type,kind' });
}
export async function deleteLibrary(uid, id, type, kind) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('library').delete()
    .match({ user_id: uid, media_id: id, media_type: type, kind });
}

export async function fetchProgress(uid) {
  if (!isSupabaseReady || !uid) return null;
  const { data, error } = await supabase.from('progress').select('*')
    .eq('user_id', uid).order('updated_at', { ascending: false });
  if (error) return null;
  return data.map((r) => ({
    id: r.media_id, type: r.media_type, title: r.title, poster: r.poster || '',
    backdrop: r.backdrop || '', year: r.year || '', season: r.season || 1,
    episode: r.episode || 1, currentTime: r.current_time || 0, duration: r.duration || 0,
    progress: r.progress || 0,
  }));
}
export async function upsertProgress(uid, it) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('progress').upsert({
    user_id: uid, media_id: it.id, media_type: it.type, title: it.title || '',
    poster: it.poster || '', backdrop: it.backdrop || '', year: String(it.year || ''),
    season: it.season || 1, episode: it.episode || 1, current_time: it.currentTime || 0,
    duration: it.duration || 0, progress: it.progress || 0, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,media_id,media_type' });
}
export async function deleteProgress(uid, id, type) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('progress').delete().match({ user_id: uid, media_id: id, media_type: type });
}

export async function fetchRatings(uid) {
  if (!isSupabaseReady || !uid) return null;
  const { data, error } = await supabase.from('ratings').select('*').eq('user_id', uid);
  if (error) return null;
  const map = {};
  for (const r of data) map[ratingKey(r.media_id, r.media_type)] = r.rating;
  return map;
}
export async function upsertRating(uid, id, type, rating) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('ratings').upsert({
    user_id: uid, media_id: id, media_type: type, rating, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,media_id,media_type' });
}
export async function deleteRating(uid, id, type) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('ratings').delete().match({ user_id: uid, media_id: id, media_type: type });
}

// ── profile ──
export async function fetchProfile(uid) {
  if (!isSupabaseReady || !uid) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
  return data || null;
}
export async function upsertProfile(uid, patch) {
  if (!isSupabaseReady || !uid) return { error: { message: 'Supabase not configured' } };
  return supabase.from('profiles').upsert({ id: uid, ...patch, updated_at: new Date().toISOString() });
}

// ── card game: wallet ──
export async function fetchWallet(uid) {
  if (!isSupabaseReady || !uid) return null;
  const { data, error } = await supabase.from('wallets').select('*').eq('user_id', uid).maybeSingle();
  if (error) return null;
  return data ? { coins: data.coins || 0, dayKey: data.day_key || '', earnedToday: data.earned_today || 0 } : { coins: 0, dayKey: '', earnedToday: 0 };
}
export async function upsertWallet(uid, w) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('wallets').upsert({
    user_id: uid, coins: w.coins, day_key: w.dayKey, earned_today: w.earnedToday, updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
}

// ── card game: cards ──
export async function fetchCards(uid) {
  if (!isSupabaseReady || !uid) return null;
  const { data, error } = await supabase.from('cards').select('*').eq('user_id', uid);
  if (error) return null;
  return data.map((r) => ({
    key: r.card_id, actorId: r.actor_id, name: r.name, character: r.character || '',
    profile: r.profile || '', rarity: r.rarity, mediaId: r.media_id, mediaTitle: r.media_title || '',
    count: r.count || 1,
  }));
}
export async function upsertCard(uid, c) {
  if (!isSupabaseReady || !uid) return;
  await supabase.from('cards').upsert({
    user_id: uid, card_id: c.key, actor_id: c.actorId, name: c.name, character: c.character || '',
    profile: c.profile || '', rarity: c.rarity, media_id: c.mediaId, media_title: c.mediaTitle || '', count: c.count,
  }, { onConflict: 'user_id,card_id' });
}

// ── comments ──
export async function fetchComments(id, type) {
  if (!isSupabaseReady) return [];
  const { data, error } = await supabase.from('comments').select('*')
    .match({ media_id: id, media_type: type }).order('created_at', { ascending: false });
  if (error) return [];
  return data;
}
export async function addComment(uid, id, type, body, authorName) {
  if (!isSupabaseReady || !uid) return { error: { message: 'Not signed in' } };
  return supabase.from('comments').insert({
    user_id: uid, media_id: id, media_type: type, body, author_name: authorName || 'User',
  });
}
export async function deleteComment(commentId) {
  if (!isSupabaseReady) return;
  await supabase.from('comments').delete().eq('id', commentId);
}
