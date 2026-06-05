import { useEffect, useRef, useState } from 'react';

// Wraps a section and adds `.in` when it scrolls into view (scroll-reveal).
export default function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setShown(true); return; }
    const el = ref.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { setShown(true); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`${className} reveal${shown ? ' in' : ''}`}>{children}</div>;
}
