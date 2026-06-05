import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import Reveal from './Reveal';

const GRADIENTS = [
  'linear-gradient(135deg,#e50914,#7a0008)',
  'linear-gradient(135deg,#ff6b35,#a8200d)',
  'linear-gradient(135deg,#6d28d9,#2a1259)',
  'linear-gradient(135deg,#0ea5e9,#0c4a6e)',
  'linear-gradient(135deg,#22c55e,#14532d)',
  'linear-gradient(135deg,#f5c518,#7a5c00)',
  'linear-gradient(135deg,#ec4899,#701a45)',
  'linear-gradient(135deg,#14b8a6,#0c4a47)',
];

export default function GenreTiles({ genres }) {
  const navigate = useNavigate();
  if (!genres || !genres.length) return null;
  const picks = genres.slice(0, 8);
  return (
    <Reveal className="row-section">
      <div className="row-head"><span className="row-title"><i className="row-title-icon" />Browse by Genre</span></div>
      <div className="genre-grid">
        {picks.map((g, i) => (
          <div
            key={g.id}
            className="genre-tile"
            style={{ background: GRADIENTS[i % GRADIENTS.length] }}
            onClick={() => navigate(`/movies?genre=${g.id}`)}
          >
            <span>{g.name}</span>
            <Play className="gt-icon" size={48} />
          </div>
        ))}
      </div>
    </Reveal>
  );
}
