export default function Pagination({ total, current, onChange }) {
  const max = Math.min(total || 1, 500);
  if (max <= 1) return null;
  let pages = [];
  if (max <= 7) { for (let i = 1; i <= max; i++) pages.push(i); }
  else {
    pages = [1];
    if (current > 3) pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(max - 1, current + 1); i++) pages.push(i);
    if (current < max - 2) pages.push('…');
    pages.push(max);
  }
  return (
    <div className="pager">
      <button className="pg-btn" disabled={current === 1} onClick={() => onChange(current - 1)}>‹</button>
      {pages.map((p, i) => p === '…'
        ? <span key={`e${i}`} style={{ padding: '0 6px', color: 'var(--muted2)' }}>…</span>
        : <button key={p} className={`pg-btn${p === current ? ' on' : ''}`} onClick={() => onChange(p)}>{p}</button>)}
      <button className="pg-btn" disabled={current === max} onClick={() => onChange(current + 1)}>›</button>
    </div>
  );
}
