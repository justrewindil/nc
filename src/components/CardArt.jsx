import { IMG } from '../lib/tmdb';

// Renders the image layer of a card. Role cards = actor portrait;
// moment cards = scene/episode still. Both are stored in `profile`.
export default function CardArt({ card, size = 'w342' }) {
  const c = card;
  if (c.profile) return <img src={`${IMG}/${size}${c.profile}`} alt={c.name} loading="lazy" />;
  return <div className="gcard-noimg">{(c.name || '?')[0]}</div>;
}
