import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const { t, lang, toggle } = useLanguage();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    const { error } = await sendPasswordReset(email.trim());
    setBusy(false);
    if (error) setError(error.message); else setDone(true);
  };

  return (
    <div className="auth-wrap">
      <button className="auth-lang" style={lang === 'he' ? { left: 20 } : { right: 20 }} onClick={toggle}>{lang === 'he' ? 'EN' : 'עברית'}</button>
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo"><img src="/logo.png" alt="JustFilmzz" /></div>
        <h1>{t('resetPassword')}</h1>
        <p className="sub">{t('resetSub')}</p>
        {error && <div className="auth-error"><AlertCircle size={15} /> {error}</div>}
        {done
          ? <div className="auth-success"><CheckCircle size={15} /> {t('resetSent')}</div>
          : (
            <>
              <div className="field">
                <label>{t('emailLabel')}</label>
                <div className="field-wrap">
                  <Mail size={16} />
                  <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <button className="auth-btn" type="submit" disabled={busy}>
                {busy ? <span className="auth-mini-spin" /> : t('sendReset')}
              </button>
            </>
          )}
        <p className="auth-switch"><Link to="/login">{t('backToLogin')}</Link></p>
      </form>
    </div>
  );
}
