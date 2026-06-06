import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, Trash2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchProfile, upsertProfile } from '../lib/db';

export default function ProfilePage() {
  const { user, signOut, sendPasswordReset } = useAuth();
  const { toast, watchlist, favorites, continueWatching } = useStore();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) fetchProfile(user.id).then((p) => { if (p?.display_name) setName(p.display_name); });
  }, [user]);

  const initial = (name || user?.email || '?')[0].toUpperCase();
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString() : '';

  const save = async () => {
    setBusy(true);
    const { error } = await upsertProfile(user.id, { display_name: name.trim() });
    setBusy(false);
    toast(error ? (error.message || 'Could not save') : t('savedOk'), error ? 'err' : 'ok');
  };
  const changePw = async () => {
    const { error } = await sendPasswordReset(user.email);
    toast(error ? error.message : t('resetSent'), error ? 'err' : 'ok');
  };
  const del = async () => {
    if (!window.confirm(t('deleteConfirm'))) return;
    // client can't delete the auth user; clear their library data + sign out
    try {
      const { supabase } = await import('../lib/supabase');
      if (supabase) {
        await Promise.all([
          supabase.from('library').delete().eq('user_id', user.id),
          supabase.from('progress').delete().eq('user_id', user.id),
          supabase.from('ratings').delete().eq('user_id', user.id),
          supabase.from('profiles').delete().eq('id', user.id),
        ]);
      }
    } catch {}
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="wl-page page-in" style={{ maxWidth: 640 }}>
      <h2>{t('profile')}</h2>
      <div className="profile-head">
        <div className="profile-avatar">{initial}</div>
        <div>
          <div className="profile-email">{user?.email}</div>
          {created && <div className="profile-sub">{t('memberSince')} {created}</div>}
        </div>
      </div>

      <div className="profile-stats">
        <div><b>{watchlist.length}</b><span>{t('watchlist')}</span></div>
        <div><b>{favorites.length}</b><span>{t('favorites')}</span></div>
        <div><b>{continueWatching.length}</b><span>{t('continueWatching')}</span></div>
      </div>

      <div className="field" style={{ marginTop: 24 }}>
        <label>{t('displayName')}</label>
        <div className="field-wrap">
          <input style={{ paddingLeft: 14 }} placeholder={user?.email} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
      <div className="profile-actions">
        <button className="btn-accent" onClick={save} disabled={busy}><Save size={15} /> {t('save')}</button>
        <button className="btn-ghost" onClick={changePw}><KeyRound size={15} /> {t('changePassword')}</button>
        <button className="btn-ghost" onClick={() => { signOut(); navigate('/login'); }}><LogOut size={15} /> {t('logout')}</button>
        <button className="btn-ghost danger" onClick={del}><Trash2 size={15} /> {t('deleteAccount')}</button>
      </div>
    </div>
  );
}
