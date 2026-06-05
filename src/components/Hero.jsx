import { useEffect, useRef, useState } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { IMG, getImages, pickLogo, typeOf, titleOf, yearOf } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';

export default function Hero({ items }) {
  const { openPlayer, openDetail } = useStore();
  const [idx, setIdx] = useState(0);
  const [logo, setLogo] = useState(null);
  const layerA = useRef(null);
  const layerB = useRef(null);
  const layersWrap = useRef(null);
  const toggle = useRef(false);

  const list = items || [];
  const cur = list[idx];

  // auto-rotate
  useEffect(() => {
    if (list.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % list.length), 7500);
    return () => clearInterval(t);
  }, [list.length]);

  // crossfade + ken burns on slide change
  useEffect(() => {
    if (!cur) return;
    const a = layerA.current, b = layerB.current;
    if (!a || !b) return;
    const incoming = toggle.current ? a : b;
    const outgoing = toggle.current ? b : a;
    incoming.style.backgroundImage = `url(${IMG}/original${cur.backdrop_path})`;
    incoming.classList.remove('kb');
    void incoming.offsetWidth; // restart animation
    incoming.classList.add('on', 'kb');
    outgoing.classList.remove('on', 'kb');
    toggle.current = !toggle.current;
  }, [idx, cur]);

  // logo art for current slide
  useEffect(() => {
    let alive = true;
    setLogo(null);
    if (cur) {
      const type = typeOf(cur);
      getImages(type, cur.id).then((imgs) => { if (alive) setLogo(pickLogo(imgs)); });
    }
    return () => { alive = false; };
  }, [idx, cur]);

  // parallax
  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const y = window.scrollY;
        const el = layersWrap.current;
        if (el && y < window.innerHeight) {
          el.style.transform = `translateY(${y * 0.4}px)`;
          el.style.opacity = String(Math.max(0, 1 - y / 650));
        }
      });
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!cur) return <div id="hero" />;
  const type = typeOf(cur);
  const title = titleOf(cur);
  const yr = yearOf(cur);
  const rt = cur.vote_average ? cur.vote_average.toFixed(1) : '?';

  return (
    <div id="hero">
      <div className="hero-layers" ref={layersWrap}>
        <div className="hero-bg" ref={layerA} />
        <div className="hero-bg" ref={layerB} />
      </div>
      <div className="hero-content">
        <div className="hero-tag"><Star size={10} fill="currentColor" stroke="none" /> Trending</div>
        {logo
          ? <img className="hero-logo" src={`${IMG}/w500${logo.file_path}`} alt={title} />
          : <h1 className="hero-title">{title}</h1>}
        <div className="hero-chips">
          <span className="chip gold">★ {rt}</span>
          {yr && <span className="chip">{yr}</span>}
          <span className="chip">{type === 'tv' ? 'TV Show' : 'Movie'}</span>
          <span className="chip green">HD</span>
        </div>
        <p className="hero-overview">{cur.overview}</p>
        <div className="hero-btns">
          <button className="btn-play" onClick={() => openPlayer(cur.id, type)}><Play size={16} fill="#fff" stroke="none" /> Watch Now</button>
          <button className="btn-info" onClick={() => openDetail(cur.id, type)}><Info size={16} /> More Info</button>
        </div>
      </div>
      <div className="hero-dots">
        {list.map((_, i) => (
          <div key={i} className={`hdot${i === idx ? ' on' : ''}`} onClick={() => setIdx(i)} />
        ))}
      </div>
    </div>
  );
}
