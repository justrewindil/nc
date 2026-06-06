import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Film, Search, Tv, Bookmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MobileNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const item = (path, Icon, label, onClick) => (
    <button className={`mnav-btn${pathname === path ? ' on' : ''}`} onClick={onClick || (() => navigate(path))}>
      <Icon size={22} /><span>{label}</span>
    </button>
  );
  return (
    <nav id="mobileNav">
      {item('/', Home, t('home'))}
      {item('/movies', Film, t('movies'))}
      {item('/search', Search, t('search').replace('…', ''), () => { navigate('/'); setTimeout(() => window.__focusSearch?.(), 50); })}
      {item('/tv', Tv, t('tv'))}
      {item('/watchlist', Bookmark, t('list'))}
    </nav>
  );
}
