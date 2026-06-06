import { useEffect, useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { fetchComments, addComment, deleteComment } from '../lib/db';
import { isSupabaseReady } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fmtDate } from '../lib/tmdb';

export default function Comments({ id, type }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [list, setList] = useState([]);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => fetchComments(id, type).then(setList);
  useEffect(() => { if (isSupabaseReady) load(); }, [id, type]);

  if (!isSupabaseReady) return null;

  const post = async (e) => {
    e.preventDefault();
    if (!body.trim() || !user) return;
    setBusy(true);
    const name = user.email?.split('@')[0] || 'User';
    const { error } = await addComment(user.id, id, type, body.trim(), name);
    setBusy(false);
    if (!error) { setBody(''); load(); }
  };
  const remove = async (cid) => { await deleteComment(cid); load(); };

  return (
    <div className="detail-section">
      <div className="detail-section-title">{t('comments')} ({list.length})</div>
      {user ? (
        <form className="cmt-form" onSubmit={post}>
          <input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t('writeComment')} maxLength={500} />
          <button className="btn-accent" disabled={busy || !body.trim()}><Send size={14} /> {t('postComment')}</button>
        </form>
      ) : <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>{t('signinToComment')}</p>}
      {list.length === 0
        ? <p style={{ color: 'var(--muted2)', fontSize: 14 }}>{t('noComments')}</p>
        : (
          <div className="cmt-list">
            {list.map((c) => (
              <div className="cmt" key={c.id}>
                <div className="cmt-avatar">{(c.author_name || '?')[0].toUpperCase()}</div>
                <div className="cmt-body">
                  <div className="cmt-head">
                    <span className="cmt-name">{c.author_name}</span>
                    <span className="cmt-date">{fmtDate(c.created_at)}</span>
                    {user?.id === c.user_id && <button className="cmt-del" onClick={() => remove(c.id)}><Trash2 size={12} /></button>}
                  </div>
                  <p className="cmt-text">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
