import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setBusy(true);
    const { error } = await updatePassword(password);
    setBusy(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => navigate('/', { replace: true }), 1800);
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo"><img src="/logo.png" alt="JustFilmzz" /></div>
        <h1>{t('newPassword')}</h1>
        {error && <div className="auth-error"><AlertCircle size={15} /> {error}</div>}
        {done && <div className="auth-success"><CheckCircle size={15} /> {t('passwordUpdated')}</div>}
        <div className="field">
          <label>{t('newPassword')}</label>
          <div className="field-wrap">
            <Lock size={16} />
            <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <button className="auth-btn" type="submit" disabled={busy || done}>
          {busy ? <span className="auth-mini-spin" /> : t('updatePassword')}
        </button>
      </form>
    </div>
  );
}
