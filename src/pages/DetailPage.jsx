import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Video, Plus, Check, Heart, Star, ArrowLeft, Layers, Package } from 'lucide-react';
import { tmdb, IMG, pickLogo, titleOf, yearOf } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import Row from '../components/Row';
import Comments from '../components/Comments';

export default function DetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { openPlayer, openTrailer, toggleWatchlist, isSaved, toggleFavorite, isFavorite, getRating, setRating, openOdds, packBusy } = useStore();
  const { t, lang } = useLanguage();
  const [d, setD] = useState(null);
  const [hoverRate, setHoverRate] = useState(0);

  useEffect(() => {
    let alive = true;
    setD(null);
    window.scrollTo(0, 0);
    tmdb(`/${type}/${id}`, { append_to_response: 'credits,videos,similar,recommendations,images', include_image_language: 'en,null' })
      .then((res) => { if (alive) setD(res); }).catch(() => {});
    return () => { alive = false; };
  }, [type, id, lang]);

  if (!d) return <div className="full-spin"><div className="spin" /></div>;

  const title = titleOf(d);
  const yr = yearOf(d);
  const rt = d.vote_average ? d.vote_average.toFixed(1) : '?';
  const genres = d.genres || [];
  const cast = (d.credits?.cast || []).slice(0, 18);
  const videos = (d.videos?.results || []).filter((v) => v.site === 'YouTube' && ['Trailer', 'Teaser', 'Clip', 'Featurette'].includes(v.type));
  const trailer = videos.find((v) => v.type === 'Trailer') || videos[0];
  const logo = pickLogo(d.images);
  const bd = d.backdrop_path ? `${IMG}/original${d.backdrop_path}` : '';
  const saved = isSaved(id, type);
  const fav = isFavorite(id, type);
  const myRating = getRating(id, type);
  const runtime = d.runtime ? `${Math.floor(d.runtime / 60)}h ${d.runtime % 60}m`
    : (d.episode_run_time?.[0] ? `${d.episode_run_time[0]}m/ep` : '');
  const item = { id: Number(id), type, title, poster: d.poster_path || '' };
  const similar = (d.recommendations?.results?.length ? d.recommendations.results : d.similar?.results || [])
    .map((r) => ({ ...r, media_type: type }));

  return (
    <div className="detail-page page-in">
      <div className="dp-hero" style={bd ? { backgroundImage: `url(${bd})` } : undefined}>
        <button className="dp-back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div className="dp-hero-inner">
          {logo
            ? <img className="dp-logo" src={`${IMG}/w500${logo.file_path}`} alt={title} />
            : <h1 className="dp-title">{title}</h1>}
          <div className="detail-chips">
            <span className="chip gold">★ {rt}</span>
            {yr && <span className="chip">{yr}</span>}
            {runtime && <span className="chip">{runtime}</span>}
            {type === 'tv' && d.number_of_seasons ? <span className="chip">{d.number_of_seasons} {t('seasons')}</span> : null}
            {d.status && <span className="chip green">{d.status}</span>}
          </div>
          <div className="detail-actions">
            <button className="btn-play" onClick={() => openPlayer(id, type)}><Play size={16} fill="#fff" stroke="none" /> {t('watchNow')}</button>
            {trailer && <button className="btn-info" onClick={() => openTrailer(trailer.key)}><Video size={16} /> {t('trailer')}</button>}
            <button className={`dp-icon-btn${saved ? ' on' : ''}`} title={t('watchlistBtn')} onClick={() => toggleWatchlist(item)}>{saved ? <Check size={18} /> : <Plus size={18} />}</button>
            <button className={`dp-icon-btn${fav ? ' on-fav' : ''}`} title={t('favorite')} onClick={() => toggleFavorite(item)}><Heart size={18} fill={fav ? 'currentColor' : 'none'} /></button>
            <button className="btn-info" disabled={packBusy} onClick={() => openOdds(id, type, title)}><Package size={16} /> {t('openPack')} · 100🪙</button>
          </div>
        </div>
      </div>

      <div className="detail-body">
        {genres.length > 0 && (
          <div className="detail-genres">
            {genres.map((g) => <span key={g.id} className="gtag" onClick={() => navigate(`/${type === 'tv' ? 'tv' : 'movies'}?genre=${g.id}`)}>{g.name}</span>)}
          </div>
        )}
        {d.overview && <><div className="detail-section-title">{t('overview')}</div><p className="detail-overview">{d.overview}</p></>}

        {/* user rating */}
        <div className="dp-rate">
          <span className="dp-rate-label">{t('yourRating')}:</span>
          <div className="dp-stars" onMouseLeave={() => setHoverRate(0)}>
            {Array.from({ length: 10 }).map((_, i) => {
              const v = i + 1;
              const active = (hoverRate || myRating) >= v;
              return (
                <button key={v} className={`dp-star${active ? ' on' : ''}`} onMouseEnter={() => setHoverRate(v)}
                  onClick={() => setRating(id, type, myRating === v ? 0 : v)} title={`${v}/10`}>
                  <Star size={18} fill={active ? 'currentColor' : 'none'} />
                </button>
              );
            })}
            {myRating > 0 && <span className="dp-rate-val">{myRating}/10</span>}
          </div>
        </div>

        {d.belongs_to_collection && (
          <button className="dp-collection" onClick={() => navigate(`/collection/${d.belongs_to_collection.id}`)}>
            <Layers size={16} /> {t('partOfCollection')}: <b>{d.belongs_to_collection.name}</b>
          </button>
        )}

        {videos.length > 0 && (
          <Row title={t('trailers')} items={videos} renderItem={(v) => (
            <div key={v.id} className="vid-thumb" onClick={() => openTrailer(v.key)}>
              <img src={`https://img.youtube.com/vi/${v.key}/mqdefault.jpg`} alt={v.name} loading="lazy" />
              <div className="vid-play"><Play size={20} fill="#fff" stroke="none" /></div>
              <span className="vid-name">{v.name}</span>
            </div>
          )} />
        )}

        {cast.length > 0 && (
          <Row title={t('cast')} items={cast} renderItem={(p) => (
            <div key={p.id} className="cast-item" onClick={() => navigate(`/person/${p.id}`)} style={{ cursor: 'pointer' }}>
              <img className="cast-avatar" src={p.profile_path ? `${IMG}/w185${p.profile_path}` : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23444%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22/%3E%3Cpath d=%22M4 20c0-4 3.6-7 8-7s8 3 8 7%22/%3E%3C/svg%3E'} alt={p.name} />
              <div className="cast-name">{p.name}</div>
              <div className="cast-char">{p.character || ''}</div>
            </div>
          )} />
        )}

        {similar.length > 0 && <Row title={t('youMayLike')} items={similar.slice(0, 18)} />}

        <Comments id={Number(id)} type={type} />
      </div>
    </div>
  );
}
