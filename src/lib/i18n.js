export const STRINGS = {
  en: {
    // nav
    home: 'Home', movies: 'Movies', tv: 'TV Shows', watchlist: 'Watchlist',
    search: 'Search…', logout: 'Logout', list: 'List',
    // home rows
    continueWatching: 'Continue Watching', trending: 'Trending This Week',
    top10: 'Top 10 Today', popularMovies: 'Popular Movies', popularTv: 'Popular TV Shows',
    topRatedMovies: 'Top Rated Movies', topRatedTv: 'Top Rated TV Shows',
    action: 'Action & Adventure', comedy: 'Comedy', dramaSeries: 'Drama Series', scifi: 'Sci-Fi',
    browseGenre: 'Browse by Genre', seeAll: 'See All', featured: 'Featured',
    // buttons / labels
    watchNow: 'Watch Now', moreInfo: 'More Info', trailer: 'Trailer',
    watchlistBtn: 'Watchlist', saved: 'Saved', play: 'Play',
    trendingTag: 'Trending', hd: 'HD', movie: 'Movie', tvShow: 'TV Show', tvSeries: 'TV Series',
    // detail
    cast: 'Cast', youMayLike: 'You May Also Like', seasons: 'seasons', eps: 'eps', votes: 'votes',
    // player
    loading: 'Loading stream…', loadingHint: 'If the screen stays black, switch servers below',
    notPlaying: 'Not playing? Switch servers', servers: 'Servers', episodes: 'Episodes',
    prev: 'Prev', next: 'Next', exit: 'Exit', season: 'Season', playing: 'PLAYING',
    noDesc: 'No description available.', left: 'left',
    // browse
    popular: 'Popular', topRated: 'Top Rated', nowPlaying: 'Now Playing', upcoming: 'Upcoming',
    onAir: 'On The Air', airingToday: 'Airing Today', allGenres: 'All Genres', allYears: 'All Years',
    results: 'results', noResults: 'No results found.', searching: 'Searching…',
    // watchlist
    myWatchlist: 'My Watchlist', emptyTitle: 'Your watchlist is empty',
    emptyDesc: 'Browse movies and shows, then tap + to save them here.', browseNow: 'Browse Now',
    // auth
    welcomeBack: 'Welcome back', signinSub: 'Sign in to continue to JustFilmzz',
    createAccount: 'Create account', signupSub: "Join JustFilmzz — it's free",
    emailLabel: 'Email', passwordLabel: 'Password', confirmLabel: 'Confirm Password',
    signIn: 'Sign In', signingIn: 'Signing in…', createBtn: 'Create Account', creating: 'Creating…',
    googleSignin: 'Sign in with Google', googleSignup: 'Sign up with Google', or: 'or',
    noAccount: "Don't have an account?", haveAccount: 'Already have an account?',
    signupLink: 'Sign up', signinLink: 'Sign in', redirecting: 'Redirecting…',
  },
  he: {
    home: 'בית', movies: 'סרטים', tv: 'סדרות', watchlist: 'הרשימה שלי',
    search: 'חיפוש…', logout: 'התנתק', list: 'רשימה',
    continueWatching: 'ממשיכים לצפות', trending: 'הלהיטים של השבוע',
    top10: '10 המובילים היום', popularMovies: 'סרטים פופולריים', popularTv: 'סדרות פופולריות',
    topRatedMovies: 'הסרטים המדורגים', topRatedTv: 'הסדרות המדורגות',
    action: 'אקשן והרפתקאות', comedy: 'קומדיה', dramaSeries: 'דרמה', scifi: 'מדע בדיוני',
    browseGenre: 'עיון לפי ז’אנר', seeAll: 'הצג הכל', featured: 'מומלץ',
    watchNow: 'צפה עכשיו', moreInfo: 'פרטים נוספים', trailer: 'טריילר',
    watchlistBtn: 'לרשימה', saved: 'נשמר', play: 'נגן',
    trendingTag: 'פופולרי עכשיו', hd: 'HD', movie: 'סרט', tvShow: 'סדרה', tvSeries: 'סדרה',
    cast: 'שחקנים', youMayLike: 'אולי יעניין אותך', seasons: 'עונות', eps: 'פרקים', votes: 'הצבעות',
    loading: 'טוען שידור…', loadingHint: 'אם המסך נשאר שחור, החלף שרת למטה',
    notPlaying: 'לא עובד? החלף שרת', servers: 'שרתים', episodes: 'פרקים',
    prev: 'הקודם', next: 'הבא', exit: 'יציאה', season: 'עונה', playing: 'מתנגן',
    noDesc: 'אין תיאור זמין.', left: 'נותרו',
    popular: 'פופולרי', topRated: 'מדורג', nowPlaying: 'עכשיו בקולנוע', upcoming: 'בקרוב',
    onAir: 'משודר עכשיו', airingToday: 'משודר היום', allGenres: 'כל הז’אנרים', allYears: 'כל השנים',
    results: 'תוצאות', noResults: 'לא נמצאו תוצאות.', searching: 'מחפש…',
    myWatchlist: 'הרשימה שלי', emptyTitle: 'הרשימה שלך ריקה',
    emptyDesc: 'עיין בסרטים וסדרות, ולחץ + כדי לשמור אותם כאן.', browseNow: 'עיין עכשיו',
    welcomeBack: 'ברוך שובך', signinSub: 'התחבר כדי להמשיך ל-JustFilmzz',
    createAccount: 'יצירת חשבון', signupSub: 'הצטרף ל-JustFilmzz — בחינם',
    emailLabel: 'אימייל', passwordLabel: 'סיסמה', confirmLabel: 'אימות סיסמה',
    signIn: 'התחבר', signingIn: 'מתחבר…', createBtn: 'צור חשבון', creating: 'יוצר…',
    googleSignin: 'התחבר עם Google', googleSignup: 'הירשם עם Google', or: 'או',
    noAccount: 'אין לך חשבון?', haveAccount: 'כבר יש לך חשבון?',
    signupLink: 'הירשם', signinLink: 'התחבר', redirecting: 'מעביר…',
  },
};

export function tr(lang, key) {
  return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.en[key] || key;
}
export const tmdbLangOf = (lang) => (lang === 'he' ? 'he-IL' : 'en-US');
