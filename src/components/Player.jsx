import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, ChevronLeft, ChevronRight, ListVideo, Info } from 'lucide-react';
import { tmdb, IMG, SOURCES, titleOf, yearOf, fmtDate } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export default function Player() {
  const { player, closePlayer, saveCw, updateCw, getCw, addWatchTime } = useStore();
  const { t } = useLanguage();

  const [meta, setMeta] = useState({ title: '', sub: '', thumb: '' });
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [season, setSeason] = useState(1);
  const [ep, setEp] = useState(1);
  const [source, setSource] = useState(0);
  const [src, setSrc] = useState('');
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [isTrailer, setIsTrailer] = useState(false);

  // refs for the postMessage handler (avoid stale closures)
  const ref = useRef({});
  const actionsRef = useRef({});
  const loadedRef = useRef(false);   // did the current iframe fire onLoad?
  const attemptsRef = useRef(0);     // auto-fallback attempts for current title
  const lastTimeRef = useRef(0);     // last reported playback time (for watch-time coins)

  const isTV = player && !player.trailerKey && player.type === 'tv';

  // build + load a source url
  const play = (s, e, resume = 0) => {
    if (!player || player.trailerKey) return;
    setLoaderHidden(false);
    setSrc(SOURCES[source].url(player.id, player.type, s, e, resume));
  };

  // ── open ──
  useEffect(() => {
    if (!player) return;
    document.body.style.overflow = 'hidden';
    setLoaderHidden(false);
    setPanelOpen(false);
    attemptsRef.current = 0;
    loadedRef.current = false;

    if (player.trailerKey) {
      setIsTrailer(true);
      setMeta({ title: 'Trailer', sub: 'Official Trailer', thumb: '' });
      setSrc(`https://www.youtube.com/embed/${player.trailerKey}?autoplay=1&rel=0`);
      return () => { document.body.style.overflow = ''; };
    }

    setIsTrailer(false);
    setSource(0);
    let alive = true;
    const { id, type } = player;
    tmdb(`/${type}/${id}`).then((det) => {
      if (!alive) return;
      const title = titleOf(det), yr = yearOf(det);
      const rt = det.vote_average ? det.vote_average.toFixed(1) : '';
      setMeta({
        title,
        sub: [yr, type === 'tv' ? 'TV Series' : 'Movie', rt ? `★ ${rt}` : ''].filter(Boolean).join('  ·  '),
        thumb: det.poster_path ? `${IMG}/w154${det.poster_path}` : '',
      });
      const saved = getCw(id, type);
      if (type === 'tv') {
        const ss = (det.seasons || []).filter((s) => s.season_number > 0);
        setSeasons(ss);
        const rs = saved?.season || 1, re = saved?.episode || 1;
        const resume = (saved && saved.season === rs && saved.episode === re) ? (saved.currentTime || 0) : 0;
        saveCw({ id, type, title, poster: det.poster_path || '', backdrop: det.backdrop_path || '', year: yr, season: rs, episode: re });
        loadEps(rs, re, resume, 0);
      } else {
        const resume = saved?.currentTime || 0;
        saveCw({ id, type, title, poster: det.poster_path || '', backdrop: det.backdrop_path || '', year: yr, season: 1, episode: 1 });
        setLoaderHidden(false);
        setSrc(SOURCES[0].url(id, type, 1, 1, resume));
      }
    }).catch(() => {});
    return () => { alive = false; document.body.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  // load a season's episodes then play given episode
  const loadEps = async (s, e, resume = 0, srcIdx) => {
    if (!player) return;
    const useIdx = srcIdx ?? source;
    setSeason(s);
    try {
      const data = await tmdb(`/tv/${player.id}/season/${s}`);
      const eps = data.episodes || [];
      setEpisodes(eps);
      const realEp = Math.min(e, eps.length) || 1;
      setEp(realEp);
      setLoaderHidden(false);
      setSrc(SOURCES[useIdx].url(player.id, 'tv', s, realEp, resume));
      updateCw(player.id, 'tv', { season: s, episode: realEp });
    } catch {}
  };

  const changeSeason = (s) => loadEps(Number(s), 1, 0);
  const pickEp = (e) => {
    setEp(e);
    play(season, e, 0);
    updateCw(player.id, 'tv', { episode: e, currentTime: 0, progress: 0 });
  };
  const prevEp = () => { if (ep > 1) pickEp(ep - 1); };
  const nextEp = () => { if (ep < episodes.length) pickEp(ep + 1); };
  const switchSrc = (i, auto = false) => {
    if (!auto) attemptsRef.current = 0; // manual switch resets the auto-fallback budget
    setSource(i);
    setLoaderHidden(false);
    loadedRef.current = false;
    setSrc(SOURCES[i].url(player.id, player.type, season, ep, 0));
  };

  // keep latest values/actions available to listeners + timers
  ref.current = { player, season, ep, episodes, source, addWatchTime };
  actionsRef.current = { pickEp, switchSrc };

  // ── auto server-fallback: if the iframe never loads, try the next server ──
  useEffect(() => {
    if (!src || isTrailer) return;
    loadedRef.current = false;
    lastTimeRef.current = 0;
    const timer = setTimeout(() => {
      if (loadedRef.current) return;                 // it loaded fine
      if (attemptsRef.current >= SOURCES.length - 1) return; // tried them all
      attemptsRef.current += 1;
      const next = (ref.current.source + 1) % SOURCES.length;
      switchSrc(next, true);
    }, 13000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, isTrailer]);

  // ── progress tracking (VidKing postMessage) ──
  useEffect(() => {
    const onMsg = (evt) => {
      let d = evt.data;
      if (typeof d === 'string') { try { d = JSON.parse(d); } catch { return; } }
      if (!d || d.type !== 'PLAYER_EVENT' || !d.data) return;
      const { player: pl, season: s, ep: e } = ref.current;
      if (!pl || pl.trailerKey) return;
      const p = d.data;
      // award coins for confirmed forward playback (watch-time → coins)
      if (p.event === 'timeupdate' && typeof p.currentTime === 'number') {
        const delta = p.currentTime - lastTimeRef.current;
        lastTimeRef.current = p.currentTime;
        if (delta > 0) ref.current.addWatchTime?.(delta);
      }
      const patch = {};
      if (typeof p.currentTime === 'number') patch.currentTime = p.currentTime;
      if (typeof p.duration === 'number') patch.duration = p.duration;
      if (typeof p.progress === 'number') patch.progress = p.progress;
      if (pl.type === 'tv') { patch.season = s; patch.episode = e; }
      const finished = p.event === 'ended' || (patch.progress && patch.progress >= 95);
      updateCw(pl.id, pl.type, patch, finished);
      // auto-play next episode when one ends
      if (p.event === 'ended' && pl.type === 'tv') {
        const eps = ref.current.episodes || [];
        if (e < eps.length) actionsRef.current.pickEp?.(e + 1);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [updateCw]);

  // Esc closes the player / episode panel
  useEffect(() => {
    if (!player) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (panelOpen) setPanelOpen(false); else closePlayer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player, panelOpen, closePlayer]);

  if (!player) return <div id="playerOverlay" />;
  const curEp = episodes.find((x) => x.episode_number === ep);

  return (
    <div id="playerOverlay" className="on">
      <div className="player-bar">
        <button className="player-back" onClick={closePlayer} title="Back"><ArrowLeft size={18} /></button>
        {meta.thumb && <img className="player-thumb" src={meta.thumb} alt="" />}
        <div className="player-titles">
          <span className="player-bar-title">{meta.title}</span>
          <span className="player-bar-sub">{meta.sub}</span>
        </div>
        <button className="player-close-btn" onClick={closePlayer}><X size={12} /> {t('exit')}</button>
      </div>

      <div className="player-frame">
        <div className={`player-loader${loaderHidden ? ' hide' : ''}`}>
          <div className="spin" />
          <p>{t('loading')}</p>
          <span>{t('loadingHint')}</span>
        </div>
        <iframe
          title="player"
          src={src}
          allowFullScreen
          allow="autoplay;encrypted-media;fullscreen;picture-in-picture"
          onLoad={() => { if (src && src !== 'about:blank') { loadedRef.current = true; setLoaderHidden(true); } }}
        />
        {isTV && (
          <div id="epPanel" className={panelOpen ? 'on' : ''}>
            <div className="epp-head">
              <h3>{t('episodes')}</h3>
              <button className="epp-close" onClick={() => setPanelOpen(false)}><X size={14} /></button>
            </div>
            <select className="epp-season" value={season} onChange={(e) => changeSeason(e.target.value)}>
              {seasons.map((s) => (
                <option key={s.season_number} value={s.season_number}>
                  {t('season')} {s.season_number}{s.episode_count ? ` · ${s.episode_count} ${t('episodes')}` : ''}
                </option>
              ))}
            </select>
            <div className="epp-list">
              {episodes.map((e) => {
                const still = e.still_path ? `${IMG}/w300${e.still_path}` : '';
                const on = e.episode_number === ep;
                return (
                  <div key={e.id} className={`epp-item${on ? ' on' : ''}`} onClick={() => pickEp(e.episode_number)}>
                    <div className="epp-thumb">
                      {still && <img src={still} loading="lazy" alt="" />}
                      <span className="epnum">E{e.episode_number}</span>
                      {on && <span className="epp-nowplay">{t('playing')}</span>}
                    </div>
                    <div className="epp-meta">
                      <div className="epp-title">{e.episode_number}. {e.name || `${t('episodes')} ${e.episode_number}`}</div>
                      <div className="epp-ov">{e.overview || t('noDesc')}</div>
                      <div className="epp-sub">{[e.air_date && fmtDate(e.air_date), e.runtime && `${e.runtime}m`, e.vote_average ? `★ ${e.vote_average.toFixed(1)}` : ''].filter(Boolean).join(' · ')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!isTrailer && (
        <div className="player-bottom">
          {isTV ? (
            <div className="pl-ctrls">
              <button className="pl-btn" onClick={prevEp} disabled={ep <= 1}><ChevronLeft size={13} /> {t('prev')}</button>
              <span className="pl-eplabel">S{season} · E{ep}{curEp?.name ? ` · ${curEp.name}` : ''}</span>
              <button className="pl-btn" onClick={nextEp} disabled={ep >= episodes.length}>{t('next')} <ChevronRight size={13} /></button>
              <button className="pl-btn accent" onClick={() => setPanelOpen((o) => !o)}><ListVideo size={13} /> {t('episodes')}</button>
            </div>
          ) : (
            <div className="player-hint"><Info size={14} /> {t('notPlaying')} →</div>
          )}
          <div className="server-group">
            <span className="server-label">{t('servers')}</span>
            {SOURCES.map((s, i) => (
              <button key={s.name} className={`server-btn${i === source ? ' on' : ''}`} onClick={() => switchSrc(i)}>
                <span className="dot" />{s.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
