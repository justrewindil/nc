import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdb } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import Hero from '../components/Hero';
import Row from '../components/Row';
import Top10Row from '../components/Top10Row';
import Spotlight from '../components/Spotlight';
import GenreTiles from '../components/GenreTiles';
import CwCard from '../components/CwCard';

export default function Home() {
  const navigate = useNavigate();
  const { continueWatching } = useStore();
  const { t, lang } = useLanguage();
  const [data, setData] = useState(null);
  const [genres, setGenres] = useState([]);
  const [recs, setRecs] = useState(null); // {title, items}

  // "Because you watched …" — recommendations from the latest watched title
  const seed = continueWatching[0];
  useEffect(() => {
    if (!seed) { setRecs(null); return; }
    let alive = true;
    tmdb(`/${seed.type}/${seed.id}/recommendations`).then((d) => {
      if (!alive) return;
      const items = (d.results || []).filter((r) => r.poster_path).slice(0, 16).map((r) => ({ ...r, media_type: seed.type }));
      setRecs(items.length ? { title: `${t('becauseYouWatched')} ${seed.title}`, items } : null);
    }).catch(() => {});
    return () => { alive = false; };
  }, [seed?.id, seed?.type, lang]); // eslint-disable-line

  useEffect(() => {
    let alive = true;
    Promise.all([
      tmdb('/trending/all/week'),
      tmdb('/movie/popular'),
      tmdb('/tv/popular'),
      tmdb('/movie/top_rated'),
      tmdb('/tv/top_rated'),
      tmdb('/discover/movie', { with_genres: '28', sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: '35', sort_by: 'popularity.desc' }),
      tmdb('/discover/tv', { with_genres: '18', sort_by: 'popularity.desc' }),
      tmdb('/discover/movie', { with_genres: '878', sort_by: 'popularity.desc' }),
      tmdb('/genre/movie/list'),
    ]).then((res) => {
      if (!alive) return;
      const [trend, popM, popTv, topM, topTv, action, comedy, drama, scifi, mg] = res;
      setGenres(mg.genres || []);
      setData({ trend, popM, popTv, topM, topTv, action, comedy, drama, scifi });
    }).catch(() => {});
    return () => { alive = false; };
  }, [lang]);

  if (!data) {
    return (
      <div className="page-in">
        <div id="hero" />
        <div className="center-spin"><div className="spin" /></div>
      </div>
    );
  }

  const { trend, popM, popTv, topM, topTv, action, comedy, drama, scifi } = data;
  const heroItems = trend.results.filter((i) => i.backdrop_path).slice(0, 8);
  const heroIds = new Set(heroItems.map((h) => h.id));
  const featured = popM.results.find((m) => !heroIds.has(m.id) && m.backdrop_path) || popM.results[0];

  return (
    <div className="page-in">
      <Hero items={heroItems} />
      <div className="home-rows">
        {continueWatching.length > 0 && (
          <Row title={t('continueWatching')} items={continueWatching} renderItem={(it) => <CwCard key={`${it.id}-${it.type}`} item={it} />} />
        )}
        {recs && <Row title={recs.title} items={recs.items} />}
        <Row title={t('trending')} items={trend.results.slice(0, 16)} />
        <Top10Row title={t('top10')} items={trend.results} />
        <Row title={t('popularMovies')} items={popM.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} seeAll={() => navigate('/movies')} />
        <Row title={t('popularTv')} items={popTv.results.slice(0, 16).map((i) => ({ ...i, media_type: 'tv' }))} seeAll={() => navigate('/tv')} />
        <Spotlight item={featured ? { ...featured, media_type: 'movie' } : null} />
        <GenreTiles genres={genres} />
        <Row title={t('topRatedMovies')} items={topM.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
        <Row title={t('topRatedTv')} items={topTv.results.slice(0, 16).map((i) => ({ ...i, media_type: 'tv' }))} />
        <Row title={t('action')} items={action.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
        <Row title={t('comedy')} items={comedy.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
        <Row title={t('dramaSeries')} items={drama.results.slice(0, 16).map((i) => ({ ...i, media_type: 'tv' }))} />
        <Row title={t('scifi')} items={scifi.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
      </div>
    </div>
  );
}
