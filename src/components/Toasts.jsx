import { Check, X, Info } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Toasts() {
  const { toasts } = useStore();
  return (
    <div id="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'ok' ? <Check size={14} color="#22c55e" />
            : t.type === 'err' ? <X size={14} color="#e50914" />
            : <Info size={14} />}
          {t.msg}
        </div>
      ))}
    </div>
  );
}
