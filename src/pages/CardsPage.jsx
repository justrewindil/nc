import { useEffect, useRef, useState } from 'react';
import { Coins, Package, Layers, Search, X } from 'lucide-react';
import { tmdb, IMG, typeOf, titleOf } from '../lib/tmdb';
import { PACK_COST, RARITIES, RARITY_ORDER, COINS_PER_MIN } from '../lib/cards';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import CardArt from '../components/CardArt';

export default function CardsPage() {
  const { coins, cards, ownedCount, openOdds, packBusy, openCardView } = useStore();
  const { t, lang } = useLanguage();
  const [titles, setTitles] = useState([]);
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null); // null = show curated list
  const searchTimer = useRef(null);

  // search any movie/show to open a pack from
  const onSearch = (val) => {
    setQ(val);
    clearTimeout(searchTimer.current);
    if (!val.trim()) { setResults(null); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const d = await tmdb('/search/multi', { query: val.trim(), page: 1 });
        setResults((d.results || []).filter((r) => r.media_type !== 'person' && r.poster_path));
      } catch { setResults([]); }
    }, 350);
  };

  // big mixed pool of movies + TV to open packs from
  useEffect(() => {
    let alive = true;
    Promise.all([
      tmdb('/trending/all/week'),
      tmdb('/movie/popular'),
      tmdb('/tv/popular'),
      tmdb('/movie/top_rated'),
      tmdb('/tv/top_rated'),
    ]).then((res) => {
      if (!alive) return;
      const forced = [null, 'movie', 'tv', 'movie', 'tv'];
      const seen = new Set();
      const merged = [];
      res.forEach((d, i) => {
        (d.results || []).forEach((r) => {
          if (!r.poster_path) return;
          const it = forced[i] ? { ...r, media_type: forced[i] } : r;
          const type = typeOf(it);
          const key = `${type}-${it.id}`;
          if (seen.has(key)) return;
          seen.add(key);
          merged.push(it);
        });
      });
      // shuffle a little for variety, keep 40
      setTitles(merged.sort(() => Math.random() - 0.5).slice(0, 40));
    }).catch(() => {});
    return () => { alive = false; };
  }, [lang]);

  const sorted = [...cards].sort((a, b) =>
    RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) ||
    (a.character || a.name).localeCompare(b.character || b.name));
  const shown = filter ? sorted.filter((c) => c.rarity === filter) : sorted;
  const byRarity = RARITY_ORDER.map((r) => ({ r, n: cards.filter((c) => c.rarity === r).length }));

  return (
    <div className="cards-page page-in">
      <div className="cards-hero">
        <div className="cards-wallet">
          <Coins size={26} className="coin-ic" />
          <div><div className="cw-coins">{coins.toLocaleString()}</div><div className="cw-label">{t('coins')}</div></div>
        </div>
        <div className="cards-stat"><Layers size={18} /> {ownedCount} {t('cardsOwned')}</div>
        <div className="cards-earn">+{COINS_PER_MIN} 🪙 / {t('perMinute')}</div>
      </div>

      <div className="browse-wrap" style={{ paddingTop: 8 }}>
        <h2 className="browse-title" style={{ marginBottom: 6 }}>
          <Package size={22} style={{ verticalAlign: '-4px', marginRight: 8 }} />{t('openPack')}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>{t('packHint')} · {PACK_COST} 🪙</p>
        <div className="pack-search">
          <Search size={16} />
          <input value={q} placeholder={t('packSearch')} onChange={(e) => onSearch(e.target.value)} />
          {q && <button onClick={() => onSearch('')} aria-label="clear"><X size={16} /></button>}
        </div>
        <div className="pack-grid">
          {(results !== null ? results : titles).map((it) => {
            const type = typeOf(it);
            return (
              <div key={`${type}-${it.id}`} className="pack-pick">
                <img src={`${IMG}/w342${it.poster_path}`} alt={titleOf(it)} loading="lazy" />
                <div className="pack-pick-info">
                  <div className="pack-pick-title">{titleOf(it)}</div>
                  <button className="btn-accent pack-open-btn" disabled={packBusy || coins < PACK_COST}
                    onClick={() => openOdds(it.id, type, titleOf(it))}>
                    <Package size={14} /> {PACK_COST} 🪙
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {results !== null && results.length === 0 && (
          <div className="no-results" style={{ padding: '30px 0' }}>{t('noResults')}</div>
        )}
      </div>

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
                <div key={c.key} className={`gcard r-${c.rarity}`} style={{ '--rc': r.color }} onClick={() => openCardView(c)}>
                  <div className="gcard-img">
                    <CardArt card={c} />
                    <span className="gcard-rarity">{r.label}</span>
                    {c.kind === 'moment' && <span className="gcard-moment">🎬 {t('moment')}</span>}
                    {c.count > 1 && <span className="gcard-count">×{c.count}</span>}
                  </div>
                  <div className="gcard-name">
                    <span className="gcard-char">{c.kind === 'moment' ? c.name : (c.character || c.name)}</span>
                    {c.kind !== 'moment' && c.character ? <span className="gcard-actor">{c.name}</span> : null}
                    {c.mediaTitle ? <span className="gcard-from">{c.mediaTitle}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
