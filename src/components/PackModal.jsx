import { X, Sparkles } from 'lucide-react';
import { RARITIES } from '../lib/cards';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import CardArt from './CardArt';

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
                  <CardArt card={c} />
                  <span className="gcard-rarity">{r.label}</span>
                  {c.kind === 'moment' && <span className="gcard-moment">🎬 {t('moment')}</span>}
                  {c.isNew ? <span className="gcard-new">NEW</span> : <span className="gcard-dupe">+{r.shard}🪙</span>}
                </div>
                <div className="gcard-name">
                  {c.kind === 'moment'
                    ? <><span className="gcard-char">{c.name}</span><span className="gcard-from">{c.mediaTitle}</span></>
                    : <><span className="gcard-char">{c.character || c.name}</span>{c.character ? <span className="gcard-actor">{c.name}</span> : null}</>}
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
