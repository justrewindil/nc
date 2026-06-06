import { useEffect, useState } from 'react';
import { X, Package } from 'lucide-react';
import { tmdb } from '../lib/tmdb';
import { PACK_COST, PACK_SIZE, RARITIES, poolOdds } from '../lib/cards';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export default function PackOddsModal() {
  const { oddsView, closeOdds, openPack, coins, packBusy } = useStore();
  const { t } = useLanguage();
  const [odds, setOdds] = useState(null);

  useEffect(() => {
    if (!oddsView) return;
    setOdds(null);
    let alive = true;
    tmdb(`/${oddsView.type}/${oddsView.id}/credits`)
      .then((d) => { if (alive) setOdds(poolOdds(d.cast || [])); })
      .catch(() => { if (alive) setOdds(poolOdds([])); });
    return () => { alive = false; };
  }, [oddsView]);

  if (!oddsView) return null;
  const canAfford = coins >= PACK_COST;

  const open = () => { openPack(oddsView.id, oddsView.type, oddsView.title); closeOdds(); };

  return (
    <div className="odds-overlay" onClick={(e) => { if (e.target.classList.contains('odds-overlay')) closeOdds(); }}>
      <div className="odds-box">
        <button className="close-btn" onClick={closeOdds}><X size={16} /></button>
        <div className="odds-head">
          <Package size={18} /> {t('oddsTitle')}
        </div>
        <div className="odds-title">{oddsView.title}</div>
        <p className="odds-hint">{t('oddsHint')}</p>

        {!odds ? (
          <div className="center-spin"><div className="spin" /></div>
        ) : (
          <div className="odds-rows">
            {odds.rows.map(({ rarity, pct, count }) => {
              const r = RARITIES[rarity];
              return (
                <div className="odds-row" key={rarity} style={{ '--rc': r.color }}>
                  <div className="odds-row-top">
                    <span className="odds-name">{r.label}</span>
                    <span className="odds-pct">{pct}%</span>
                  </div>
                  <div className="odds-bar"><span style={{ width: `${pct}%` }} /></div>
                  {odds.examples[rarity]?.length > 0 && (
                    <div className="odds-eg">{count > 0 ? odds.examples[rarity].join(', ') + (count > 3 ? '…' : '') : '—'}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button className="btn-accent odds-open" disabled={packBusy || !canAfford} onClick={open}>
          <Package size={15} /> {t('openPack')} · {PACK_COST} 🪙
        </button>
        {!canAfford && <div className="odds-warn">{t('notEnough')}</div>}
      </div>
    </div>
  );
}
