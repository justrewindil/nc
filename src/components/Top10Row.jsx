import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from './Reveal';
import { IMG, typeOf, titleOf } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';

export default function Top10Row({ title, items }) {
  const { openDetail } = useStore();
  const scrollRef = useRef(null);
  const scrollBy = (dir) => {
    const sc = scrollRef.current;
    if (sc) sc.scrollBy({ left: dir * sc.clientWidth * 0.85, behavior: 'smooth' });
  };
  const list = (items || []).slice(0, 10);
  if (!list.length) return null;
  return (
    <Reveal className="row-section">
      <div className="row-head"><span className="row-title"><i className="row-title-icon" />{title}</span></div>
      <div className="row-wrap">
        <button className="row-arrow left" onClick={() => scrollBy(-1)} aria-label="Scroll left"><ChevronLeft size={20} /></button>
        <div className="row-scroll top10-scroll" ref={scrollRef}>
          {list.map((it, i) => {
            const type = typeOf(it);
            const img = it.poster_path ? `${IMG}/w342${it.poster_path}` : '';
            return (
              <div className="top10-card" key={it.id} onClick={() => openDetail(it.id, type)}>
                <span className="top10-rank">{i + 1}</span>
                <div className="top10-poster">
                  {img && <img src={img} alt={titleOf(it)} loading="lazy" onLoad={(e) => e.currentTarget.classList.add('loaded')} />}
                </div>
              </div>
            );
          })}
        </div>
        <button className="row-arrow right" onClick={() => scrollBy(1)} aria-label="Scroll right"><ChevronRight size={20} /></button>
      </div>
    </Reveal>
  );
}
