import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button id="btt" className={show ? 'on' : ''} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <ChevronUp size={16} />
    </button>
  );
}
