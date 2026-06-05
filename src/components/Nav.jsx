import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { tmdb, IMG, typeOf, titleOf, yearOf } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openDetail, watchlist } = useStore();
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // expose focus for mobile nav
  useEffect(() => {
    window.__focusSearch = () => { inputRef.current?.focus(); };
    return () => { delete window.__focusSearch; };
  }, []);

  const onChange = (val) => {
    setQ(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults(null); setOpen(false); return; }
    setOpen(true); setResults('loading');
    timer.current = setTimeout(async () => {
      try {
        const data = await tmdb('/search/multi', { query: val.trim(), page: 1 });
        setResults((data.results || []).filter((r) => r.media_type !== 'person' && r.poster_path).slice(0, 7));
      } catch { setResults([]); }
    }, 350);
  };

  const goFull = () => { navigate(`/search?q=${encodeURIComponent(q)}`); setOpen(false); };
  const isOn = (path) => location.pathname === path;
  const tabs = [['/', 'Home'], ['/movies', 'Movies'], ['/tv', 'TV Shows'], ['/watchlist', 'Watchlist']];

  return (
    <nav id="nav" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-logo" onClick={() => navigate('/')}><img src="/logo.png" alt="JustFilmzz" /></div>
      <div className="nav-links">
        {tabs.map(([path, label]) => (
          <button key={path} className={`nav-btn${isOn(path) ? ' on' : ''}`} onClick={() => navigate(path)}>
            {label}
            {path === '/watchlist' && watchlist.length > 0 && <span className="wl-badge">{watchlist.length}</span>}
          </button>
        ))}
      </div>
      <div className="nav-spacer" />
      <div className="nav-search-wrap" ref={wrapRef}>
        <div className="nav-search">
          <Search size={15} />
          <input
            ref={inputRef}
            value={q}
            placeholder="Search…"
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => q && setOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' && q.trim()) goFull(); }}
          />
        </div>
        {open && (
          <div id="searchDrop">
            {results === 'loading' && <div className="sdrop-loading">Searching…</div>}
            {Array.isArray(results) && results.length === 0 && <div className="sdrop-empty">No results found</div>}
            {Array.isArray(results) && results.map((r) => {
              const type = typeOf(r);
              return (
                <div key={r.id} className="sdrop-item" onClick={() => { openDetail(r.id, type); setOpen(false); }}>
                  <img className="sdrop-poster" src={`${IMG}/w92${r.poster_path}`} alt="" />
                  <div>
                    <div className="sdrop-title">{titleOf(r)}<span className="sdrop-type">{type === 'tv' ? 'TV' : 'Movie'}</span></div>
                    <div className="sdrop-meta">{yearOf(r) ? `${yearOf(r)} · ` : ''}★ {r.vote_average?.toFixed(1) || '?'}</div>
                  </div>
                </div>
              );
            })}
            {Array.isArray(results) && results.length > 0 && (
              <div className="sdrop-item" onClick={goFull} style={{ justifyContent: 'center', color: 'var(--accent)', fontWeight: 600, fontSize: 13 }}>
                See all results for "{q}" →
              </div>
            )}
          </div>
        )}
      </div>
      <div className="nav-user">
        <div className="nav-avatar" title={user?.email}>{(user?.email || '?')[0]}</div>
        <button className="nav-logout" onClick={signOut}><LogOut size={14} /><span>Logout</span></button>
      </div>
    </nav>
  );
}
