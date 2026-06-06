import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { tmdb } from '../lib/tmdb';
import Card from '../components/Card';
import Pagination from '../components/Pagination';
import { useLanguage } from '../context/LanguageContext';

const SORTS = {
  movie: [['popular', 'popular'], ['top_rated', 'topRated'], ['now_playing', 'nowPlaying'], ['upcoming', 'upcoming']],
  tv: [['popular', 'popular'], ['top_rated', 'topRated'], ['on_the_air', 'onAir'], ['airing_today', 'airingToday']],
};
const YEARS = (() => { const now = new Date().getFullYear(); const a = []; for (let y = now; y >= 1950; y--) a.push(y); return a; })();
const SORT_BY = (type) => ({
  '': 'popularity.desc',
  rating: 'vote_average.desc',
  newest: type === 'movie' ? 'primary_release_date.desc' : 'first_air_date.desc',
  oldest: type === 'movie' ? 'primary_release_date.asc' : 'first_air_date.asc',
});

export default function Browse({ type }) {
  const { t, lang } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [genres, setGenres] = useState([]);
  const [sort, setSort] = useState('popular');     // preset tabs
  const [genre, setGenre] = useState(params.get('genre') || '');
  const [year, setYear] = useState('');
  const [sortBy, setSortBy] = useState('');         // advanced sort
  const [minRating, setMinRating] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setSort('popular'); setGenre(params.get('genre') || ''); setYear(''); setSortBy(''); setMinRating(''); setPage(1); }, [type]); // eslint-disable-line

  useEffect(() => {
    tmdb(`/genre/${type}/list`).then((d) => setGenres(d.genres || [])).catch(() => {});
  }, [type, lang]);

  const useDiscover = genre || year || sortBy || minRating;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const p = { page };
    const run = () => {
      if (useDiscover) {
        if (genre) p.with_genres = genre;
        if (year) p[type === 'movie' ? 'primary_release_year' : 'first_air_date_year'] = year;
        p.sort_by = sortBy ? SORT_BY(type)[sortBy] : (sort === 'top_rated' ? 'vote_average.desc' : 'popularity.desc');
        if (sortBy === 'rating' || sort === 'top_rated') p['vote_count.gte'] = type === 'movie' ? 100 : 50;
        if (minRating) { p['vote_average.gte'] = minRating; p['vote_count.gte'] = Math.max(p['vote_count.gte'] || 0, 50); }
        return tmdb(`/discover/${type}`, p);
      }
      return tmdb(`/${type}/${sort}`, p);
    };
    run().then((d) => { if (alive) { setData(d); setLoading(false); window.scrollTo(0, 0); } }).catch(() => setLoading(false));
    return () => { alive = false; };
  }, [type, sort, genre, year, sortBy, minRating, page, lang]); // eslint-disable-line

  const onGenre = (v) => { setGenre(v); setPage(1); if (v) setParams({ genre: v }); else setParams({}); };

  return (
    <div className="browse-wrap page-in">
      <div className="browse-head">
        <h2 className="browse-title">{type === 'movie' ? t('movies') : t('tv')}</h2>
        <div className="browse-filters">
          <div className="sort-tabs">
            {SORTS[type].map(([val, key]) => (
              <button key={val} className={`sort-tab${sort === val && !sortBy ? ' on' : ''}`} onClick={() => { setSort(val); setSortBy(''); setPage(1); }}>{t(key)}</button>
            ))}
          </div>
          <select className="fselect" value={genre} onChange={(e) => onGenre(e.target.value)}>
            <option value="">{t('allGenres')}</option>
            {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <select className="fselect" value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}>
            <option value="">{t('sortBy')}: {t('sortPopularity')}</option>
            <option value="rating">{t('sortBy')}: {t('sortRating')}</option>
            <option value="newest">{t('sortBy')}: {t('sortNewest')}</option>
            <option value="oldest">{t('sortBy')}: {t('sortOldest')}</option>
          </select>
          <select className="fselect" value={minRating} onChange={(e) => { setMinRating(e.target.value); setPage(1); }}>
            <option value="">{t('anyRating')}</option>
            {[9, 8, 7, 6, 5].map((r) => <option key={r} value={r}>{t('minRating')}: {r}+</option>)}
          </select>
          <select className="fselect" value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
            <option value="">{t('allYears')}</option>
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
