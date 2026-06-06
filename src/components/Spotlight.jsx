import { useEffect, useState } from 'react';
import { Play, Info } from 'lucide-react';
import Reveal from './Reveal';
import { IMG, getImages, pickLogo, typeOf, titleOf, yearOf } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export default function Spotlight({ item }) {
  const { openPlayer, openDetail } = useStore();
  const { t } = useLanguage();
  const [logo, setLogo] = useState(null);
  const type = item ? typeOf(item) : 'movie';

  useEffect(() => {
    let alive = true;
    if (item) getImages(type, item.id).then((imgs) => { if (alive) setLogo(pickLogo(imgs)); });
    return () => { alive = false; };
  }, [item, type]);

  if (!item) return null;
  const title = titleOf(item);
  const yr = yearOf(item);
  const rt = item.vote_average ? item.vote_average.toFixed(1) : '';
  const bd = item.backdrop_path ? `${IMG}/original${item.backdrop_path}` : '';

  return (
    <Reveal>
      <div className="spotlight" style={{ backgroundImage: `url(${bd})` }}>
        <div className="spot-inner">
          <span className="spot-tag">{t('featured')}</span>
          {logo
            ? <img className="spot-logo" src={`${IMG}/w500${logo.file_path}`} alt={title} />
            : <h2 className="spot-title">{title}</h2>}
          <div className="spot-meta">
            {rt && <span className="chip gold">★ {rt}</span>}
            {yr && <span className="chip">{yr}</span>}
            <span className="chip">{type === 'tv' ? t('tvSeries') : t('movie')}</span>
          </div>
          <p className="spot-ov">{item.overview}</p>
          <div className="hero-btns">
            <button className="btn-play" onClick={() => openPlayer(item.id, type)}><Play size={16} fill="#fff" stroke="none" /> {t('watchNow')}</button>
            <button className="btn-info" onClick={() => openDetail(item.id, type)}><Info size={16} /> {t('moreInfo')}</button>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
