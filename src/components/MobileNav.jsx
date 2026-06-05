import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Film, Search, Tv, Bookmark } from 'lucide-react';

export default function MobileNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const item = (path, Icon, label, onClick) => (
    <button className={`mnav-btn${pathname === path ? ' on' : ''}`} onClick={onClick || (() => navigate(path))}>
      <Icon size={22} /><span>{label}</span>
    </button>
  );
  return (
    <nav id="mobileNav">
      {item('/', Home, 'Home')}
      {item('/movies', Film, 'Movies')}
      {item('/search', Search, 'Search', () => { navigate('/'); setTimeout(() => window.__focusSearch?.(), 50); })}
      {item('/tv', Tv, 'TV')}
      {item('/watchlist', Bookmark, 'List')}
    </nav>
  );
}
