import { useEffect, useState } from 'react';
import { Coins, Package, Layers } from 'lucide-react';
import { tmdb, IMG, typeOf, titleOf } from '../lib/tmdb';
import { PACK_COST, RARITIES, RARITY_ORDER, COINS_PER_MIN } from '../lib/cards';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';

export default function CardsPage() {
  const { coins, cards, ownedCount, openPack, packBusy } = useStore();
  const { t, lang } = useLanguage();
  const [titles, setTitles] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    tmdb('/trending/all/week').then((d) => setTitles((d.results || []).filter((r) => r.poster_path).slice(0, 12))).catch(() => {});
  }, [lang]);

  const sorted = [...cards].sort((a, b) =>
    RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) || a.name.localeCompare(b.name));
  const shown = filter ? sorted.filter((c) => c.rarity === filter) : sorted;
  const byRarity = RARITY_ORDER.map((r) => ({ r, n: cards.filter((c) => c.rarity === r).length }));

  return (
    <div className="cards-page page-in">
      {/* wallet header */}
      <div className="cards-hero">
        <div className="cards-wallet">
          <Coins size={26} className="coin-ic" />
          <div><div className="cw-coins">{coins.toLocaleString()}</div><div className="cw-label">{t('coins')}</div></div>
        </div>
        <div className="cards-stat"><Layers size={18} /> {ownedCount} {t('cardsOwned')}</div>
        <div className="cards-earn">+{COINS_PER_MIN} 🪙 / {t('perMinute')}</div>
      </div>

      {/* open packs */}
      <div className="browse-wrap" style={{ paddingTop: 8 }}>
        <h2 className="browse-title" style={{ marginBottom: 6 }}><Package size={22} style={{ verticalAlign: '-4px', marginRight: 8 }} />{t('openPack')}</h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>{t('packHint')} · {PACK_COST} 🪙</p>
        <div className="pack-grid">
          {titles.map((it) => {
            const type = typeOf(it);
            return (
              <div key={it.id} className="pack-pick">
                <img src={`${IMG}/w342${it.poster_path}`} alt={titleOf(it)} loading="lazy" />
                <div className="pack-pick-info">
                  <div className="pack-pick-title">{titleOf(it)}</div>
                  <button className="btn-accent pack-open-btn" disabled={packBusy || coins < PACK_COST}
                    onClick={() => openPack(it.id, type, titleOf(it))}>
                    <Package size={14} /> {PACK_COST} 🪙
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* collection */}
      <div className="browse-wrap" style={{ paddingTop: 8 }}>
        <h2 className="browse-title" style={{ marginBottom: 16 }}>{t('myCards')}</h2>
        <div className="rarity-filters">
          <button className={`rf${filter === '' ? ' on' : ''}`} onClick={() => setFilter('')}>{t('allCards')} ({cards.length})</button>
          {byRarity.map(({ r, n }) => (
            <button key={r} className={`rf${filter === r ? ' on' : ''}`} style={{ '--rc': RARITIES[r].color }} onClick={() => setFilter(r)}>
              {RARITIES[r].label} ({n})
            </button>
          ))}
        </div>
        {shown.length === 0 ? (
          <div className="wl-empty"><div className="wl-empty-icon">🃏</div><h3>{t('noCards')}</h3><p>{t('noCardsDesc')}</p></div>
        ) : (
          <div className="gcard-grid">
            {shown.map((c) => {
              const r = RARITIES[c.rarity];
              return (
                <div key={c.actorId} className={`gcard r-${c.rarity}`} style={{ '--rc': r.color }}>
                  <div className="gcard-img">
                    {c.profile ? <img src={`${IMG}/w342${c.profile}`} alt={c.name} loading="lazy" /> : <div className="gcard-noimg">{c.name[0]}</div>}
                    <span className="gcard-rarity">{r.label}</span>
                    {c.count > 1 && <span className="gcard-count">×{c.count}</span>}
                  </div>
                  <div className="gcard-name">{c.name}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
