import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdb } from '../lib/tmdb';
import Card from '../components/Card';
import Pagination from '../components/Pagination';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(1); }, [q]);

  useEffect(() => {
    if (!q) return;
    let alive = true;
    setLoading(true);
    tmdb('/search/multi', { query: q, page }).then((d) => {
      if (!alive) return;
      d.results = (d.results || []).filter((r) => r.media_type !== 'person');
      setData(d); setLoading(false); window.scrollTo(0, 0);
    }).catch(() => setLoading(false));
    return () => { alive = false; };
  }, [q, page]);

  return (
    <div className="search-page page-in">
      <div className="search-info">
        <h2>"{q}"</h2>
        <p>{data ? `${data.total_results.toLocaleString()} results` : 'Searching…'}</p>
      </div>
      <div className="browse-grid">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <div key={i} className="skel skel-card-g" />)
          : (data?.results?.length
            ? data.results.map((it) => <Card key={`${it.id}-${it.media_type}`} item={it} />)
            : <div className="no-results">No results found.</div>)}
      </div>
      {data && <Pagination total={data.total_pages} current={page} onChange={setPage} />}
    </div>
  );
}
