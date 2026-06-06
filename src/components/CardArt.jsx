import { IMG } from '../lib/tmdb';

// Renders the image layer of a collectible card.
// Role cards show a SCENE backdrop from the title with the actor's portrait as
// an avatar inset; moment cards show the scene/episode still directly.
export default function CardArt({ card, size = 'w342' }) {
  const c = card;
  if (c.kind === 'role' && c.scene) {
    return (
      <>
        <img className="gcard-scene" src={`${IMG}/${size}${c.scene}`} alt="" loading="lazy" />
        {c.profile && <img className="gcard-avatar" src={`${IMG}/w185${c.profile}`} alt={c.name} loading="lazy" />}
      </>
    );
  }
  if (c.profile) return <img src={`${IMG}/${size}${c.profile}`} alt={c.name} loading="lazy" />;
  return <div className="gcard-noimg">{(c.name || '?')[0]}</div>;
}
