// Per-user localStorage helpers for watchlist + continue-watching.
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const wlKey = (uid) => `jfz_wl_${uid || 'guest'}`;
export const cwKey = (uid) => `jfz_cw_${uid || 'guest'}`;

export const loadWatchlist = (uid) => read(wlKey(uid));
export const saveWatchlist = (uid, v) => write(wlKey(uid), v);
export const loadContinue = (uid) => read(cwKey(uid));
export const saveContinue = (uid, v) => write(cwKey(uid), v);
