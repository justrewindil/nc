import { Play, X } from 'lucide-react';
import { IMG, fmtLeft } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export default function CwCard({ item }) {
  const { openPlayer, removeCw } = useStore();
  const { t, lang } = useLanguage();
  const img = item.backdrop ? `${IMG}/w500${item.backdrop}` : (item.poster ? `${IMG}/w342${item.poster}` : '');
  const pct = Math.min(100, Math.max(0, item.progress || 0));
  const remain = (item.currentTime && item.duration) ? fmtLeft(item.duration - item.currentTime) : '';
  const left = remain ? (lang === 'he' ? `${t('left')} ${remain}` : `${remain} ${t('left')}`) : '';
  return (
    <div className="cw-card" onClick={() => openPlayer(item.id, item.type)}>
      <div className="cw-backdrop">
        {img && <img src={img} alt={item.title} loading="lazy" />}
        <div className="cw-play"><div className="play-circle"><Play size={16} fill="#000" stroke="none" /></div></div>
        {pct > 0 && <div className="cw-bar"><span style={{ width: `${pct}%` }} /></div>}
      </div>
      <div className="cw-info">
        <div className="cw-title">{item.title}</div>
        <div className="cw-sub">{item.type === 'tv' ? `S${item.season} E${item.episode}` : item.year}{left ? ` · ${left}` : ''}</div>
      </div>
      <button className="cw-remove" onClick={(e) => { e.stopPropagation(); removeCw(item.id, item.type); }} title="Remove"><X size={12} /></button>
    </div>
  );
}
