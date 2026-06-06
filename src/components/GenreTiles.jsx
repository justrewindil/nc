import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import Reveal from './Reveal';
import { tmdb, IMG } from '../lib/tmdb';
import { useLanguage } from '../context/LanguageContext';

// [from, to] colour pairs per tile
const PAIRS = [
  ['#e50914', '#7a0008'], ['#ff6b35', '#a8200d'], ['#6d28d9', '#2a1259'], ['#0ea5e9', '#0c4a6e'],
  ['#22c55e', '#14532d'], ['#f5c518', '#7a5c00'], ['#ec4899', '#701a45'], ['#14b8a6', '#0c4a47'],
];
const flat = (i) => `linear-gradient(135deg,${PAIRS[i % 8][0]},${PAIRS[i % 8][1]})`;
// gradient tint laid OVER the backdrop image (alpha hex: cc≈80%, b3≈70%)
const overlay = (i) => `linear-gradient(135deg,${PAIRS[i % 8][0]}d9,${PAIRS[i % 8][1]}b3)`;

export default function GenreTiles({ genres }) {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [imgs, setImgs] = useState({});

  const picks = (genres || []).slice(0, 8);

  // fetch a representative backdrop for each genre (top popular title)
  useEffect(() => {
    let alive = true;
    if (!picks.length) return;
    Promise.all(picks.map((g) =>
      tmdb('/discover/movie', { with_genres: g.id, sort_by: 'popularity.desc', 'vote_count.gte': 200 })
        .then((d) => {
          const hit = (d.results || []).find((r) => r.backdrop_path);
          return [g.id, hit ? `${IMG}/w780${hit.backdrop_path}` : ''];
        }).catch(() => [g.id, ''])
    )).then((pairs) => { if (alive) setImgs(Object.fromEntries(pairs)); });
    return () => { alive = false; };
  }, [picks.map((g) => g.id).join(','), lang]); // eslint-disable-line

  if (!picks.length) return null;

  return (
    <Reveal className="row-section">
      <div className="row-head"><span className="row-title"><i className="row-title-icon" />{t('browseGenre')}</span></div>
      <div className="genre-grid">
        {picks.map((g, i) => {
          const img = imgs[g.id];
          const bg = img ? `${overlay(i)}, url(${img})` : flat(i);
          return (
            <div
              key={g.id}
              className="genre-tile"
              style={{ backgroundImage: bg }}
              onClick={() => navigate(`/movies?genre=${g.id}`)}
            >
              <span>{g.name}</span>
              <Play className="gt-icon" size={48} />
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
