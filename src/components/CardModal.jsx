import { useNavigate } from 'react-router-dom';
import { X, Play, Info, User } from 'lucide-react';
import { RARITIES } from '../lib/cards';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import CardArt from './CardArt';

export default function CardModal() {
  const { cardView, closeCardView, openPlayer } = useStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  if (!cardView) return null;

  const c = cardView;
  const r = RARITIES[c.rarity] || RARITIES.common;
  const isMoment = c.kind === 'moment';
  const type = c.mediaType || (c.season ? 'tv' : 'movie');
  const wide = isMoment || (c.kind === 'role' && c.scene);

  const watch = () => {
    if (isMoment && type === 'tv' && c.season) openPlayer(c.mediaId, 'tv', { season: c.season, episode: c.episode });
    else openPlayer(c.mediaId, type);
    closeCardView();
  };
  const goTitle = () => { navigate(`/title/${type}/${c.mediaId}`); closeCardView(); };
  const goActor = () => { navigate(`/person/${c.actorId}`); closeCardView(); };

  return (
    <div className="cardview-overlay" onClick={(e) => { if (e.target.classList.contains('cardview-overlay')) closeCardView(); }}>
      <div className="cardview-box" style={{ '--rc': r.color }}>
        <button className="close-btn" onClick={closeCardView}><X size={16} /></button>
        <div className={`cardview-img ${wide ? 'wide' : 'tall'}`}>
          <CardArt card={c} size="w780" />
          <span className="gcard-rarity">{r.label}</span>
          {isMoment && <span className="gcard-moment">🎬 {t('moment')}</span>}
        </div>
        <div className="cardview-body">
          <h2 className="cardview-title">{isMoment ? c.name : (c.character || c.name)}</h2>
          {!isMoment && c.character && <div className="cardview-actor"><User size={13} /> {c.name}</div>}
          {c.mediaTitle && <div className="cardview-from">{c.mediaTitle}</div>}
          <div className="cardview-actions">
            <button className="btn-accent" onClick={watch}><Play size={15} fill="#fff" stroke="none" /> {isMoment && type === 'tv' ? t('watchEpisode') : t('watchNow')}</button>
            <button className="btn-ghost" onClick={goTitle}><Info size={14} /> {t('moreInfo')}</button>
            {!isMoment && c.actorId > 0 && <button className="btn-ghost" onClick={goActor}><User size={14} /> {t('cast')}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
