import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  loadWatchlist, saveWatchlist, loadContinue, saveContinue,
  loadFavorites, saveFavorites, loadRatings, saveRatings,
} from '../lib/storage';
import * as db from '../lib/db';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);
const rk = (id, type) => `${type}-${id}`;

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.id;
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [ratings, setRatings] = useState({});
  const [toasts, setToasts] = useState([]);
  const [player, setPlayer] = useState(null); // {id,type} or {trailerKey}

  // ── load per-user data (Supabase if available, else localStorage) ──
  useEffect(() => {
    let alive = true;
    // start from localStorage immediately (instant + offline)
    setWatchlist(loadWatchlist(uid));
    setFavorites(loadFavorites(uid));
    setContinueWatching(loadContinue(uid));
    setRatings(loadRatings(uid));
    // then hydrate from Supabase if signed in + tables exist
    if (uid) {
      (async () => {
        const [lib, prog, rats] = await Promise.all([
          db.fetchLibrary(uid), db.fetchProgress(uid), db.fetchRatings(uid),
        ]);
        if (!alive) return;
        if (lib) { setWatchlist(lib.watchlist); setFavorites(lib.favorites); }
        if (prog) setContinueWatching(prog);
        if (rats) setRatings(rats);
      })();
    }
    return () => { alive = false; };
  }, [uid]);

  // persist to localStorage on change
  useEffect(() => { saveWatchlist(uid, watchlist); }, [watchlist, uid]);
  useEffect(() => { saveFavorites(uid, favorites); }, [favorites, uid]);
  useEffect(() => { saveContinue(uid, continueWatching); }, [continueWatching, uid]);
  useEffect(() => { saveRatings(uid, ratings); }, [ratings, uid]);

  // ── toasts ──
  const toastId = useRef(0);
  const toast = useCallback((msg, type = '') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  // ── watchlist ──
  const isSaved = useCallback((id, type) => watchlist.some((w) => w.id === Number(id) && w.type === type), [watchlist]);
  const toggleWatchlist = useCallback((item) => {
    const id = Number(item.id);
    setWatchlist((list) => {
      const exists = list.some((w) => w.id === id && w.type === item.type);
      if (exists) { toast('Removed from watchlist'); db.deleteLibrary(uid, id, item.type, 'watchlist'); return list.filter((w) => !(w.id === id && w.type === item.type)); }
      const entry = { id, type: item.type, title: item.title, poster: item.poster || '' };
      toast('Added to watchlist', 'ok'); db.upsertLibrary(uid, entry, 'watchlist');
      return [...list, entry];
    });
  }, [toast, uid]);

  // ── favorites ──
  const isFavorite = useCallback((id, type) => favorites.some((w) => w.id === Number(id) && w.type === type), [favorites]);
  const toggleFavorite = useCallback((item) => {
    const id = Number(item.id);
    setFavorites((list) => {
      const exists = list.some((w) => w.id === id && w.type === item.type);
      if (exists) { toast('Removed from favorites'); db.deleteLibrary(uid, id, item.type, 'favorite'); return list.filter((w) => !(w.id === id && w.type === item.type)); }
      const entry = { id, type: item.type, title: item.title, poster: item.poster || '' };
      toast('Added to favorites', 'ok'); db.upsertLibrary(uid, entry, 'favorite');
      return [...list, entry];
    });
  }, [toast, uid]);

  // ── ratings ──
  const getRating = useCallback((id, type) => ratings[rk(id, type)] || 0, [ratings]);
  const setRating = useCallback((id, type, value) => {
    id = Number(id);
    setRatings((map) => {
      const next = { ...map };
      if (!value) { delete next[rk(id, type)]; db.deleteRating(uid, id, type); }
      else { next[rk(id, type)] = value; db.upsertRating(uid, id, type, value); toast(`Rated ${value}/10`, 'ok'); }
      return next;
    });
  }, [toast, uid]);

  // ── continue watching ──
  const saveCw = useCallback((item) => {
    setContinueWatching((list) => {
      const prev = list.find((i) => i.id === item.id && i.type === item.type);
      if (prev) {
        item.currentTime = item.currentTime ?? prev.currentTime;
        item.duration = item.duration ?? prev.duration;
        item.progress = item.progress ?? prev.progress;
      }
      const filtered = list.filter((i) => !(i.id === item.id && i.type === item.type));
      return [item, ...filtered].slice(0, 12);
    });
    db.upsertProgress(uid, item);
  }, [uid]);
  const updateCw = useCallback((id, type, patch, drop = false) => {
    setContinueWatching((list) => {
      if (drop) { db.deleteProgress(uid, id, type); return list.filter((i) => !(i.id === id && i.type === type)); }
      const updated = list.map((i) => (i.id === id && i.type === type ? { ...i, ...patch } : i));
      const it = updated.find((i) => i.id === id && i.type === type);
      if (it) db.upsertProgress(uid, it);
      return updated;
    });
  }, [uid]);
  const removeCw = useCallback((id, type) => {
    db.deleteProgress(uid, id, type);
    setContinueWatching((list) => list.filter((i) => !(i.id === id && i.type === type)));
  }, [uid]);
  const getCw = useCallback((id, type) => continueWatching.find((i) => i.id === Number(id) && i.type === type), [continueWatching]);

  // ── navigation / overlays ──
  const openDetail = useCallback((id, type) => navigate(`/title/${type}/${id}`), [navigate]);
  const openPlayer = useCallback((id, type) => setPlayer({ id: Number(id), type }), []);
  const openTrailer = useCallback((key) => setPlayer({ trailerKey: key }), []);
  const closePlayer = useCallback(() => setPlayer(null), []);

  const value = {
    watchlist, isSaved, toggleWatchlist,
    favorites, isFavorite, toggleFavorite,
    ratings, getRating, setRating,
    continueWatching, saveCw, updateCw, removeCw, getCw,
    toasts, toast,
    player, openDetail, openPlayer, openTrailer, closePlayer,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
