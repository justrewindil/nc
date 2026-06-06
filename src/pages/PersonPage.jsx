import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { tmdb, IMG, fmtDate } from '../lib/tmdb';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';

export default function PersonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [p, setP] = useState(null);

  useEffect(() => {
    let alive = true; setP(null); window.scrollTo(0, 0);
    tmdb(`/person/${id}`, { append_to_response: 'combined_credits' })
      .then((res) => { if (alive) setP(res); }).catch(() => {});
    return () => { alive = false; };
  }, [id, lang]);

  if (!p) return <div className="full-spin"><div className="spin" /></div>;

  const known = (p.combined_credits?.cast || [])
    .filter((c) => c.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id && x.media_type === c.media_type) === i);

  return (
    <div className="person-page page-in">
      <button className="dp-back solid" onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
      <div className="person-head">
        <img className="person-photo" src={p.profile_path ? `${IMG}/w342${p.profile_path}` : 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%23444%22%3E%3Ccircle cx=%2212%22 cy=%228%22 r=%224%22/%3E%3Cpath d=%22M4 20c0-4 3.6-7 8-7s8 3 8 7%22/%3E%3C/svg%3E'} alt={p.name} />
        <div className="person-info">
          <h1>{p.name}</h1>
          {p.birthday && <p className="person-meta">{t('born')}: {fmtDate(p.birthday)}{p.place_of_birth ? ` · ${p.place_of_birth}` : ''}</p>}
          {p.known_for_department && <span className="chip">{p.known_for_department}</span>}
          {p.biography && <p className="person-bio">{p.biography}</p>}
        </div>
      </div>
      {known.length > 0 && (
        <div className="browse-wrap" style={{ paddingTop: 8 }}>
          <h2 className="browse-title" style={{ marginBottom: 20 }}>{t('knownFor')}</h2>
          <div className="browse-grid">
            {known.slice(0, 40).map((c) => <Card key={`${c.id}-${c.media_type}`} item={c} />)}
          </div>
        </div>
      )}
    </div>
  );
}
