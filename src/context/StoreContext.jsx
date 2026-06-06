import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  loadWatchlist, saveWatchlist, loadContinue, saveContinue,
  loadFavorites, saveFavorites, loadRatings, saveRatings,
  loadWallet, saveWallet, loadCards, saveCards,
} from '../lib/storage';
import * as db from '../lib/db';
import { tmdb } from '../lib/tmdb';
import { PACK_COST, COINS_PER_MIN, DAILY_EARN_CAP, RARITIES, buildPack } from '../lib/cards';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);
const rk = (id, type) => `${type}-${id}`;
const todayKey = () => new Date().toDateString();

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
  const [wallet, setWallet] = useState({ coins: 0, dayKey: '', earnedToday: 0 });
  const [cards, setCards] = useState([]); // [{actorId,name,profile,rarity,count}]
  const [packResult, setPackResult] = useState(null);
  const [packBusy, setPackBusy] = useState(false);
  const secAccum = useRef(0);

  // ── load per-user data (Supabase if available, else localStorage) ──
  useEffect(() => {
    let alive = true;
    // start from localStorage immediately (instant + offline)
    setWatchlist(loadWatchlist(uid));
    setFavorites(loadFavorites(uid));
    setContinueWatching(loadContinue(uid));
    setRatings(loadRatings(uid));
    setWallet(loadWallet(uid));
    setCards(loadCards(uid));
    // then hydrate from Supabase if signed in + tables exist
    if (uid) {
      (async () => {
        const [lib, prog, rats, wal, crd] = await Promise.all([
          db.fetchLibrary(uid), db.fetchProgress(uid), db.fetchRatings(uid),
          db.fetchWallet(uid), db.fetchCards(uid),
        ]);
        if (!alive) return;
        if (lib) { setWatchlist(lib.watchlist); setFavorites(lib.favorites); }
        if (prog) setContinueWatching(prog);
        if (rats) setRatings(rats);
        if (wal) setWallet(wal);
        if (crd) setCards(crd);
      })();
    }
    return () => { alive = false; };
  }, [uid]);

  // persist to localStorage on change
  useEffect(() => { saveWatchlist(uid, watchlist); }, [watchlist, uid]);
  useEffect(() => { saveFavorites(uid, favorites); }, [favorites, uid]);
  useEffect(() => { saveContinue(uid, continueWatching); }, [continueWatching, uid]);
  useEffect(() => { saveRatings(uid, ratings); }, [ratings, uid]);
  useEffect(() => { saveWallet(uid, wallet); }, [wallet, uid]);
  useEffect(() => { saveCards(uid, cards); }, [cards, uid]);

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

  // ── card game: earn coins from watch time ──
  const addWatchTime = useCallback((deltaSec) => {
    if (!deltaSec || deltaSec <= 0 || deltaSec > 8) return; // ignore seeks/jumps
    secAccum.current += deltaSec;
    if (secAccum.current < 60) return;
    const minutes = Math.floor(secAccum.current / 60);
    secAccum.current -= minutes * 60;
    setWallet((w) => {
      const day = todayKey();
      const earnedToday = w.dayKey === day ? w.earnedToday : 0;
      const room = Math.max(0, DAILY_EARN_CAP - earnedToday);
      const gain = Math.min(minutes * COINS_PER_MIN, room);
      if (gain <= 0) return { ...w, dayKey: day, earnedToday };
      const next = { coins: w.coins + gain, dayKey: day, earnedToday: earnedToday + gain };
      db.upsertWallet(uid, next);
      return next;
    });
  }, [uid]);

  // ── card game: open a pack for a title ──
  const openPack = useCallback(async (id, type, titleName) => {
    if (packBusy) return;
    if (wallet.coins < PACK_COST) { toast('Not enough coins', 'err'); return; }
    setPackBusy(true);
    try {
      const credits = await tmdb(`/${type}/${id}/credits`);
      const pulled = buildPack(credits.cast || []);
      if (!pulled.length) { toast('No cards available for this title', 'err'); setPackBusy(false); return; }
      let refund = 0;
      const result = [];
      setCards((list) => {
        const next = [...list];
        for (const c of pulled) {
          const idx = next.findIndex((x) => x.actorId === c.actorId);
          let isNew = false;
          if (idx > -1) { next[idx] = { ...next[idx], count: next[idx].count + 1 }; refund += RARITIES[c.rarity].shard; db.upsertCard(uid, next[idx]); }
          else { const card = { ...c, count: 1 }; next.push(card); isNew = true; db.upsertCard(uid, card); }
          result.push({ ...c, isNew });
        }
        return next;
      });
      setWallet((w) => {
        const next = { ...w, coins: w.coins - PACK_COST + refund };
        db.upsertWallet(uid, next);
        return next;
      });
      setPackResult({ title: titleName, cards: result, refund });
    } catch { toast('Could not open pack', 'err'); }
    setPackBusy(false);
  }, [packBusy, wallet.coins, toast, uid]);
  const closePack = useCallback(() => setPackResult(null), []);
  const ownedCount = cards.reduce((n, c) => n + (c.count || 1), 0);

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
    coins: wallet.coins, cards, ownedCount, addWatchTime,
    openPack, packResult, closePack, packBusy,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
