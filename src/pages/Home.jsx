import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tmdb } from '../lib/tmdb';
import { useStore } from '../context/StoreContext';
import Hero from '../components/Hero';
import Row from '../components/Row';
import Top10Row from '../components/Top10Row';
import Spotlight from '../components/Spotlight';
import GenreTiles from '../components/GenreTiles';
import CwCard from '../components/CwCard';

export default function Home() {
  const navigate = useNavigate();
  const { continueWatching } = useStore();
  const [data, setData] = useState(null);
  const [genres, setGenres] = useState([]);

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
  }, []);

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
          <Row title="Continue Watching" items={continueWatching} renderItem={(it) => <CwCard key={`${it.id}-${it.type}`} item={it} />} />
        )}
        <Row title="Trending This Week" items={trend.results.slice(0, 16)} />
        <Top10Row title="Top 10 Today" items={trend.results} />
        <Row title="Popular Movies" items={popM.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} seeAll={() => navigate('/movies')} />
        <Row title="Popular TV Shows" items={popTv.results.slice(0, 16).map((i) => ({ ...i, media_type: 'tv' }))} seeAll={() => navigate('/tv')} />
        <Spotlight item={featured ? { ...featured, media_type: 'movie' } : null} />
        <GenreTiles genres={genres} />
        <Row title="Top Rated Movies" items={topM.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
        <Row title="Top Rated TV Shows" items={topTv.results.slice(0, 16).map((i) => ({ ...i, media_type: 'tv' }))} />
        <Row title="Action & Adventure" items={action.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
        <Row title="Comedy" items={comedy.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
        <Row title="Drama Series" items={drama.results.slice(0, 16).map((i) => ({ ...i, media_type: 'tv' }))} />
        <Row title="Sci-Fi" items={scifi.results.slice(0, 16).map((i) => ({ ...i, media_type: 'movie' }))} />
      </div>
    </div>
  );
}
