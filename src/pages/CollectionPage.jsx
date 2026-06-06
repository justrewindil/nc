import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tmdb, IMG } from '../lib/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';

export default function CollectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [c, setC] = useState(null);

  useEffect(() => {
    let alive = true; setC(null); window.scrollTo(0, 0);
    tmdb(`/collection/${id}`).then((res) => { if (alive) setC(res); }).catch(() => {});
    return () => { alive = false; };
  }, [id, lang]);

  if (!c) return <div className="full-spin"><div className="spin" /></div>;
  const parts = (c.parts || []).slice().sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
  const bd = c.backdrop_path ? `${IMG}/original${c.backdrop_path}` : '';

  return (
    <div className="detail-page page-in">
      <div className="dp-hero" style={bd ? { backgroundImage: `url(${bd})` } : undefined}>
        <button className="dp-back" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
        <div className="dp-hero-inner">
          <h1 className="dp-title">{c.name}</h1>
          {c.overview && <p className="detail-overview" style={{ maxWidth: 620 }}>{c.overview}</p>}
        </div>
      </div>
      <div className="browse-wrap">
        <div className="browse-grid">
          {parts.map((m) => <Card key={m.id} item={{ ...m, media_type: 'movie' }} />)}
        </div>
      </div>
    </div>
  );
}
