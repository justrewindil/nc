import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './Card';
import Reveal from './Reveal';

export default function Row({ title, items, seeAll, renderItem }) {
  const scrollRef = useRef(null);
  const scrollBy = (dir) => {
    const sc = scrollRef.current;
    if (sc) sc.scrollBy({ left: dir * sc.clientWidth * 0.85, behavior: 'smooth' });
  };
  if (!items || !items.length) return null;
  return (
    <Reveal className="row-section">
      <div className="row-head">
        <span className="row-title"><i className="row-title-icon" />{title}</span>
        {seeAll && (
          <button className="row-see-all" onClick={seeAll}>See All <ChevronRight size={13} /></button>
        )}
      </div>
      <div className="row-wrap">
        <button className="row-arrow left" onClick={() => scrollBy(-1)} aria-label="Scroll left"><ChevronLeft size={20} /></button>
        <div className="row-scroll" ref={scrollRef}>
          {items.map((it, i) => (renderItem ? renderItem(it, i) : <Card key={`${it.id}-${i}`} item={it} />))}
        </div>
        <button className="row-arrow right" onClick={() => scrollBy(1)} aria-label="Scroll right"><ChevronRight size={20} /></button>
      </div>
    </Reveal>
  );
}
