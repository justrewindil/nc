// Per-user localStorage helpers (instant + offline + guest fallback).
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
const readObj = (k) => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch { return {}; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const u = (uid) => uid || 'guest';
export const wlKey = (uid) => `jfz_wl_${u(uid)}`;
export const cwKey = (uid) => `jfz_cw_${u(uid)}`;
export const favKey = (uid) => `jfz_fav_${u(uid)}`;
export const rateKey = (uid) => `jfz_rate_${u(uid)}`;

export const loadWatchlist = (uid) => read(wlKey(uid));
export const saveWatchlist = (uid, v) => write(wlKey(uid), v);
export const loadContinue = (uid) => read(cwKey(uid));
export const saveContinue = (uid, v) => write(cwKey(uid), v);
export const loadFavorites = (uid) => read(favKey(uid));
export const saveFavorites = (uid, v) => write(favKey(uid), v);
export const loadRatings = (uid) => readObj(rateKey(uid)); // { "movie-603": 8, ... }
export const saveRatings = (uid, v) => write(rateKey(uid), v);
