import { useEffect, useState } from 'react';
import { X, Play, Video, Plus, Check, Star } from 'lucide-react';
import { tmdb, IMG, titleOf, yearOf } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import Card from './Card';

export default function DetailModal() {
  const { detail, closeDetail, openPlayer, openTrailer, toggleWatchlist, isSaved } = useStore();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!detail) return;
    setData(null);
    document.body.style.overflow = 'hidden';
    let alive = true;
    const { id, type } = detail;
    Promise.all([
      tmdb(`/${type}/${id}`),
      tmdb(`/${type}/${id}/credits`),
      tmdb(`/${type}/${id}/videos`),
      tmdb(`/${type}/${id}/similar`),
    ]).then(([det, creds, vids, sim]) => {
      if (!alive) return;
      setData({ det, creds, vids, sim });
    }).catch(() => {});
    return () => { alive = false; document.body.style.overflow = ''; };
  }, [detail]);

  const onOverlay = (e) => { if (e.target.id === 'detailOverlay') closeDetail(); };

  let inner = null;
  if (detail) {
    if (!data) {
      inner = <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spin" /></div>;
    } else {
      const { det, creds, vids, sim } = data;
      const { type, id } = detail;
      const title = titleOf(det);
      const yr = yearOf(det);
      const rt = det.vote_average ? det.vote_average.toFixed(1) : '?';
      const genres = det.genres || [];
      const cast = (creds.cast || []).slice(0, 14);
      const trailer = vids.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
      const bd = det.backdrop_path ? `${IMG}/original${det.backdrop_path}` : '';
      const saved = isSaved(id, type);
      const runtime = det.runtime ? `${Math.floor(det.runtime / 60)}h ${det.runtime % 60}m`
        : (det.episode_run_time?.[0] ? `${det.episode_run_time[0]}m/ep` : '');
      inner = (
        <>
          {bd && <div className="detail-backdrop"><img src={bd} alt={title} /></div>}
          <div className="detail-body">
            <h2 className="detail-title">{title}</h2>
            <div className="detail-chips">
              <span className="chip gold">★ {rt}</span>
              {yr && <span className="chip">{yr}</span>}
              {runtime && <span className="chip">{runtime}</span>}
              {det.vote_count ? <span className="chip">{det.vote_count.toLocaleString()} votes</span> : null}
              {type === 'tv' && det.number_of_seasons ? <span className="chip">{det.number_of_seasons} seasons</span> : null}
              {type === 'tv' && det.number_of_episodes ? <span className="chip">{det.number_of_episodes} eps</span> : null}
              {det.status && <span className="chip green">{det.status}</span>}
            </div>
            {genres.length > 0 && <div className="detail-genres">{genres.map((g) => <span key={g.id} className="gtag">{g.name}</span>)}</div>}
            {det.overview && <p className="detail-overview">{det.overview}</p>}
            <div className="detail-actions">
              <button className="btn-accent" onClick={() => openPlayer(id, type)}><Play size={15} fill="#fff" stroke="none" /> Watch Now</button>
              {trailer && <button className="btn-ghost" onClick={() => openTrailer(trailer.key)}><Video size={14} /> Trailer</button>}
              <button className="btn-ghost" onClick={() => toggleWatchlist({ id, type, title, poster: det.poster_path || '' })}>
                {saved ? <><Check size={14} /> Saved</> : <><Plus size={14} /> Watchlist</>}
              </button>
            </div>
            {cast.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Cast</div>
                <div className="cast-row">
                  {cast.map((p) => (
                    <div className="cast-item" key={p.id}>
                      <img className="cast-avatar" src={p.profile_path ? `${IMG}/w185${p.profile_path}` : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23444%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22/%3E%3Cpath d=%22M4 20c0-4 3.6-7 8-7s8 3 8 7%22/%3E%3C/svg%3E'} alt={p.name} />
                      <div className="cast-name">{p.name}</div>
                      <div className="cast-char">{p.character || ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {sim.results?.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">You May Also Like</div>
                <div className="similar-row">
                  {sim.results.slice(0, 10).map((r) => <Card key={r.id} item={{ ...r, media_type: type }} />)}
                </div>
              </div>
            )}
          </div>
        </>
      );
    }
  }

  return (
    <div id="detailOverlay" className={detail ? 'on' : ''} onClick={onOverlay}>
      <div id="detailBox">
        <button className="close-btn" onClick={closeDetail}><X size={16} /></button>
        {inner}
      </div>
    </div>
  );
}
