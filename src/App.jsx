import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { LanguageProvider } from './context/LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';
import Nav from './components/Nav';
import MobileNav from './components/MobileNav';
import Player from './components/Player';
import PackModal from './components/PackModal';
import CardModal from './components/CardModal';
import Toasts from './components/Toasts';
import BackToTop from './components/BackToTop';

// route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const Browse = lazy(() => import('./pages/Browse'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const WatchlistPage = lazy(() => import('./pages/WatchlistPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const DetailPage = lazy(() => import('./pages/DetailPage'));
const PersonPage = lazy(() => import('./pages/PersonPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const CardsPage = lazy(() => import('./pages/CardsPage'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const NotFound = lazy(() => import('./pages/NotFound'));

function FullSpin() {
  return <div className="full-spin"><div className="spin" /></div>;
}

function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullSpin />;
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
      <main><Suspense fallback={<FullSpin />}><Outlet /></Suspense></main>
      <MobileNav />
      <Player />
      <PackModal />
      <CardModal />
      <Toasts />
      <BackToTop />
    </StoreProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <div id="grain" />
          <HashRouter>
            <Suspense fallback={<FullSpin />}>
              <Routes>
                <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
                <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
                <Route path="/forgot" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
                <Route path="/reset" element={<ResetPassword />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/movies" element={<Browse type="movie" />} />
                    <Route path="/tv" element={<Browse type="tv" />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/cards" element={<CardsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/title/:type/:id" element={<DetailPage />} />
                    <Route path="/person/:id" element={<PersonPage />} />
                    <Route path="/collection/:id" element={<CollectionPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </HashRouter>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
