import { X, Sparkles } from 'lucide-react';
import { IMG } from '../lib/tmdb';
import { RARITIES } from '../lib/cards';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export default function PackModal() {
  const { packResult, closePack } = useStore();
  const { t } = useLanguage();
  if (!packResult) return null;
  const { cards, refund } = packResult;

  return (
    <div className="pack-overlay" onClick={(e) => { if (e.target.classList.contains('pack-overlay')) closePack(); }}>
      <div className="pack-box">
        <button className="close-btn" onClick={closePack}><X size={16} /></button>
        <div className="pack-head"><Sparkles size={18} /> {t('packOpened')}</div>
        <div className="pack-cards">
          {cards.map((c, i) => {
            const r = RARITIES[c.rarity];
            return (
              <div key={`${c.key}-${i}`} className={`gcard r-${c.rarity}`} style={{ '--rc': r.color, animationDelay: `${i * 0.12}s` }}>
                <div className="gcard-img">
                  {c.profile
                    ? <img src={`${IMG}/w342${c.profile}`} alt={c.name} />
                    : <div className="gcard-noimg">{c.name[0]}</div>}
                  <span className="gcard-rarity">{r.label}</span>
                  {c.isNew ? <span className="gcard-new">NEW</span> : <span className="gcard-dupe">+{r.shard}🪙</span>}
                </div>
                <div className="gcard-name">
                  <span className="gcard-char">{c.character || c.name}</span>
                  {c.character ? <span className="gcard-actor">{c.name}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
        {refund > 0 && <div className="pack-refund">{t('dupesRefunded')}: +{refund} 🪙</div>}
        <button className="btn-accent pack-done" onClick={closePack}>{t('awesome')}</button>
      </div>
    </div>
  );
}
