import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import GoogleButton from '../components/GoogleButton';

export default function Signup() {
  const { signUp, ready } = useAuth();
  const { t, lang, toggle } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setDone('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    const { data, error } = await signUp(email.trim(), password);
    setBusy(false);
    if (error) {
      const m = error.message || '';
      if (/rate limit/i.test(m)) {
        setError('Email rate limit hit. Disable "Confirm email" in Supabase → Authentication → Providers → Email, or wait ~1 hour.');
      } else { setError(m); }
      return;
    }
    // If email confirmation is on, there's no active session yet.
    if (data?.session) {
      navigate('/', { replace: true });
    } else {
      setDone('Account created! Check your email to confirm, then sign in.');
    }
  };

  return (
    <div className="auth-wrap">
      <button className="auth-lang" style={lang === 'he' ? { left: 20 } : { right: 20 }} onClick={toggle}>{lang === 'he' ? 'EN' : 'עברית'}</button>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo"><img src="/logo.png" alt="JustFilmzz" /></div>
        <h1>{t('createAccount')}</h1>
        <p className="sub">{t('signupSub')}</p>

        {!ready && (
          <div className="auth-config-warn">
            ⚠ Supabase isn't configured. Add <b>VITE_SUPABASE_URL</b> and <b>VITE_SUPABASE_ANON_KEY</b> to <b>.env</b> and restart the dev server.
          </div>
        )}
        {error && <div className="auth-error"><AlertCircle size={15} /> {error}</div>}
        {done && <div className="auth-success"><CheckCircle size={15} /> {done}</div>}

        <GoogleButton label={t('googleSignup')} />
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
        <div className="field">
          <label>{t('confirmLabel')}</label>
          <div className="field-wrap">
            <Lock size={16} />
            <input type="password" required placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
        </div>

        <button className="auth-btn" type="submit" disabled={busy}>
          {busy ? <><span className="auth-mini-spin" /> {t('creating')}</> : t('createBtn')}
        </button>

        <p className="auth-switch">{t('haveAccount')} <Link to="/login">{t('signinLink')}</Link></p>
      </form>
    </div>
  );
}
