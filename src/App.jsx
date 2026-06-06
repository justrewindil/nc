import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { LanguageProvider } from './context/LanguageContext';
import Nav from './components/Nav';
import MobileNav from './components/MobileNav';
import DetailModal from './components/DetailModal';
import Player from './components/Player';
import Toasts from './components/Toasts';
import BackToTop from './components/BackToTop';
import Home from './pages/Home';
import Browse from './pages/Browse';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';
import Login from './pages/Login';
import Signup from './pages/Signup';

function FullSpin() {
  return <div className="full-spin"><div className="spin" /></div>;
}

function ProtectedRoute() {
  const { user, loading, ready } = useAuth();
  const location = useLocation();
  if (loading) return <FullSpin />;
  // If Supabase isn't configured, send to login which shows the setup hint.
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullSpin />;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  return (
    <StoreProvider>
      <Nav />
      <main><Outlet /></main>
      <MobileNav />
      <DetailModal />
      <Player />
      <Toasts />
      <BackToTop />
    </StoreProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
    <AuthProvider>
      <div id="grain" />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
          <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/movies" element={<Browse type="movie" />} />
              <Route path="/tv" element={<Browse type="tv" />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
    </LanguageProvider>
  );
}
