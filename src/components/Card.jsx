import { Play, Plus, Check, Info } from 'lucide-react';
import { IMG, typeOf, titleOf, yearOf } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';

export default function Card({ item }) {
  const { openDetail, openPlayer, toggleWatchlist, isSaved } = useStore();
  const id = item.id;
  const type = typeOf(item);
  const title = titleOf(item);
  const yr = yearOf(item);
  const rt = item.vote_average ? item.vote_average.toFixed(1) : '?';
  const img = item.poster_path ? `${IMG}/w342${item.poster_path}` : '';
  const saved = isSaved(id, type);

  const wl = (e) => { e.stopPropagation(); toggleWatchlist({ id, type, title, poster: item.poster_path || '' }); };
  const play = (e) => { e.stopPropagation(); openPlayer(id, type); };
  const info = (e) => { e.stopPropagation(); openDetail(id, type); };

  return (
    <div className="card" onClick={() => openDetail(id, type)}>
      <div className="card-poster" style={item.poster_path ? { backgroundImage: `url(${IMG}/w92${item.poster_path})` } : undefined}>
        {img
          ? <img src={img} alt={title} loading="lazy" onLoad={(e) => e.currentTarget.classList.add('loaded')} />
          : <div className="no-img"><Info size={32} /></div>}
        <div className="card-hover">
          <button className="ch-mainplay" onClick={play} title="Play">
            <span className="play-circle"><Play size={16} fill="#000" stroke="none" /></span>
          </button>
          <div className="ch-bar">
            <button className="ch-btn primary" onClick={play}><Play size={13} fill="currentColor" stroke="none" /> Play</button>
            <button className={`ch-btn icon ch-wl${saved ? ' saved' : ''}`} onClick={wl} title={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}>
              {saved ? <Check size={14} /> : <Plus size={14} />}
            </button>
            <button className="ch-btn icon" onClick={info} title="More info"><Info size={14} /></button>
          </div>
        </div>
        <div className="card-top">
          <span className="badge badge-hd">HD</span>
          <button className={`card-wl-btn${saved ? ' saved' : ''}`} onClick={wl} title={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}>
            {saved ? <Check size={12} /> : <Plus size={12} />}
          </button>
        </div>
        {rt !== '?' && <span className="card-pill"><span className="star">★</span> {rt}</span>}
      </div>
      <div className="card-info">
        <div className="card-title" title={title}>{title}</div>
        <div className="card-sub">
          <span className="card-year">{yr || '—'}</span>
          <span className="card-typetag">{type === 'tv' ? 'TV' : 'Movie'}</span>
        </div>
      </div>
    </div>
  );
}
