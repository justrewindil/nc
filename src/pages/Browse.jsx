import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdb } from '../lib/tmdb';
import Card from '../components/Card';
import Pagination from '../components/Pagination';

const SORTS = {
  movie: [['popular', 'Popular'], ['top_rated', 'Top Rated'], ['now_playing', 'Now Playing'], ['upcoming', 'Upcoming']],
  tv: [['popular', 'Popular'], ['top_rated', 'Top Rated'], ['on_the_air', 'On The Air'], ['airing_today', 'Airing Today']],
};
const YEARS = (() => { const now = new Date().getFullYear(); const a = []; for (let y = now; y >= 1950; y--) a.push(y); return a; })();

export default function Browse({ type }) {
  const [params, setParams] = useSearchParams();
  const [genres, setGenres] = useState([]);
  const [sort, setSort] = useState('popular');
  const [genre, setGenre] = useState(params.get('genre') || '');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // reset state when switching movie<->tv
  useEffect(() => { setSort('popular'); setGenre(params.get('genre') || ''); setYear(''); setPage(1); }, [type]); // eslint-disable-line

  useEffect(() => {
    tmdb(`/genre/${type}/list`).then((d) => setGenres(d.genres || [])).catch(() => {});
  }, [type]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const p = { page };
    if (genre) p.with_genres = genre;
    const fetchData = () => {
      if (genre || year) {
        p.sort_by = sort === 'top_rated' ? 'vote_average.desc' : 'popularity.desc';
        if (sort === 'top_rated') p['vote_count.gte'] = type === 'movie' ? 100 : 50;
        if (year) p[type === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = year;
        return tmdb(`/discover/${type}`, p);
      }
      return tmdb(`/${type}/${sort}`, p);
    };
    fetchData().then((d) => { if (alive) { setData(d); setLoading(false); window.scrollTo(0, 0); } }).catch(() => setLoading(false));
    return () => { alive = false; };
  }, [type, sort, genre, year, page]);

  const onGenre = (v) => { setGenre(v); setPage(1); if (v) setParams({ genre: v }); else setParams({}); };

  return (
    <div className="browse-wrap page-in">
      <div className="browse-head">
        <h2 className="browse-title">{type === 'movie' ? 'Movies' : 'TV Shows'}</h2>
        <div className="browse-filters">
          <div className="sort-tabs">
            {SORTS[type].map(([val, label]) => (
              <button key={val} className={`sort-tab${sort === val ? ' on' : ''}`} onClick={() => { setSort(val); setPage(1); }}>{label}</button>
            ))}
          </div>
          <select className="fselect" value={genre} onChange={(e) => onGenre(e.target.value)}>
            <option value="">All Genres</option>
            {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className="fselect" value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      <div className="browse-grid">
        {loading
          ? Array.from({ length: 20 }).map((_, i) => <div key={i} className="skel skel-card-g" />)
          : (data?.results || []).map((it) => <Card key={it.id} item={{ ...it, media_type: type }} />)}
      </div>
      {data && <Pagination total={data.total_pages} current={page} onChange={setPage} />}
    </div>
  );
}
