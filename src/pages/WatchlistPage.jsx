import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Card from '../components/Card';

export default function WatchlistPage() {
  const navigate = useNavigate();
  const { watchlist } = useStore();
  return (
    <div className="wl-page page-in">
      <h2>My Watchlist</h2>
      {watchlist.length === 0 ? (
        <div className="wl-empty">
          <div className="wl-empty-icon">🎬</div>
          <h3>Your watchlist is empty</h3>
          <p>Browse movies and shows, then tap + to save them here.</p>
          <button className="btn-accent" style={{ margin: '0 auto' }} onClick={() => navigate('/')}>Browse Now</button>
        </div>
      ) : (
        <div className="browse-grid">
          {watchlist.map((w) => (
            <Card key={`${w.id}-${w.type}`} item={{ id: w.id, media_type: w.type, title: w.title, poster_path: w.poster, vote_average: 0 }} />
          ))}
        </div>
      )}
    </div>
  );
}
