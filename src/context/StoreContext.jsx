import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
  loadWatchlist, saveWatchlist, loadContinue, saveContinue,
} from '../lib/storage';

const StoreContext = createContext(null);
export const useStore = () => useContext(StoreContext);

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.id;

  const [watchlist, setWatchlist] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [detail, setDetail] = useState(null); // {id,type}
  const [player, setPlayer] = useState(null); // {id,type} or {trailerKey}

  // load per-user data whenever the user changes
  useEffect(() => {
    setWatchlist(loadWatchlist(uid));
    setContinueWatching(loadContinue(uid));
  }, [uid]);

  // persist
  useEffect(() => { saveWatchlist(uid, watchlist); }, [watchlist, uid]);
  useEffect(() => { saveContinue(uid, continueWatching); }, [continueWatching, uid]);

  // ── toasts ──
  const toastId = useRef(0);
  const toast = useCallback((msg, type = '') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  // ── watchlist ──
  const isSaved = useCallback(
    (id, type) => watchlist.some((w) => w.id === Number(id) && w.type === type),
    [watchlist]
  );
  const toggleWatchlist = useCallback((item) => {
    const id = Number(item.id);
    setWatchlist((list) => {
      const exists = list.some((w) => w.id === id && w.type === item.type);
      if (exists) { toast('Removed from watchlist'); return list.filter((w) => !(w.id === id && w.type === item.type)); }
      toast('Added to watchlist', 'ok');
      return [...list, { id, type: item.type, title: item.title, poster: item.poster || '' }];
    });
  }, [toast]);

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
  }, []);
  const updateCw = useCallback((id, type, patch, drop = false) => {
    setContinueWatching((list) => {
      if (drop) return list.filter((i) => !(i.id === id && i.type === type));
      return list.map((i) => (i.id === id && i.type === type ? { ...i, ...patch } : i));
    });
  }, []);
  const removeCw = useCallback((id, type) => {
    setContinueWatching((list) => list.filter((i) => !(i.id === id && i.type === type)));
  }, []);
  const getCw = useCallback(
    (id, type) => continueWatching.find((i) => i.id === Number(id) && i.type === type),
    [continueWatching]
  );

  // ── overlays ──
  const openDetail = useCallback((id, type) => setDetail({ id: Number(id), type }), []);
  const closeDetail = useCallback(() => setDetail(null), []);
  const openPlayer = useCallback((id, type) => { setDetail(null); setPlayer({ id: Number(id), type }); }, []);
  const openTrailer = useCallback((key) => { setDetail(null); setPlayer({ trailerKey: key }); }, []);
  const closePlayer = useCallback(() => setPlayer(null), []);

  const value = {
    watchlist, isSaved, toggleWatchlist,
    continueWatching, saveCw, updateCw, removeCw, getCw,
    toasts, toast,
    detail, openDetail, closeDetail,
    player, openPlayer, openTrailer, closePlayer,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
