import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites } = useStore();
  const { t } = useLanguage();
  return (
    <div className="wl-page page-in">
      <h2>{t('myFavorites')}</h2>
      {favorites.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">❤️</div>
          <h3>{t('emptyTitle')}</h3>
          <p>{t('emptyDesc')}</p>
          <button className="btn-accent" style={{ margin: '0 auto' }} onClick={() => navigate('/')}>{t('browseNow')}</button>
        </div>
      ) : (
        <div className="browse-grid">
          {favorites.map((w) => (
            <Card key={`${w.id}-${w.type}`} item={{ id: w.id, media_type: w.type, title: w.title, poster_path: w.poster, vote_average: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}
