import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import GoogleButton from '../components/GoogleButton';

export default function Login() {
  const { signIn, ready } = useAuth();
  const { t, lang, toggle } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) { setError(error.message); return; }
    navigate(location.state?.from || '/', { replace: true });
  };

  return (
    <div className="auth-wrap">
      <button className="auth-lang" style={lang === 'he' ? { left: 20 } : { right: 20 }} onClick={toggle}>{lang === 'he' ? 'EN' : 'עברית'}</button>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo"><img src="/logo.png" alt="JustFilmzz" /></div>
        <h1>{t('welcomeBack')}</h1>
        <p className="sub">{t('signinSub')}</p>

        {!ready && (
          <div className="auth-config-warn">
            ⚠ Supabase isn't configured. Add <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> to <b>.env</b> and restart the dev server.
          </div>
        )}
        {error && <div className="auth-error"><AlertCircle size={15} /> {error}</div>}

        <GoogleButton label={t('googleSignin')} />
        <div className="auth-divider"><span>{t('or')}</span></div>

        <div className="field">
          <label>{t('emailLabel')}</label>
          <div className="field-wrap">
            <Mail size={16} />
            <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t('passwordLabel')}</label>
          <div className="field-wrap">
            <Lock size={16} />
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={busy}>
          {busy ? <><span className="auth-mini-spin" /> {t('signingIn')}</> : t('signIn')}
        </button>

        <p className="auth-switch">{t('noAccount')} <Link to="/signup">{t('signupLink')}</Link></p>
      </form>
    </div>
  );
}
