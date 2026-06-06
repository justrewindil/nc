import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <div className="notfound page-in">
      <div className="notfound-code">404</div>
      <h1>{t('notFoundTitle')}</h1>
      <p>{t('notFoundDesc')}</p>
      <button className="btn-accent" onClick={() => navigate('/')}>{t('browseNow')}</button>
    </div>
  );
}
