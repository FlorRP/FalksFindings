import { useState } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLang } from '../../contexts/LanguageContext';

export default function AdminLogin() {
  const { signIn } = useAuth();
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    if (err) setError(t.admin.login.error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-theme flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--header-bg)' }}>
              <Search size={28} strokeWidth={2.5} style={{ color: '#D4A017' }} />
            </div>
          </div>
          <h1 className="text-title text-2xl font-extrabold" style={{ fontFamily: 'Georgia, serif' }}>
            Falks Findings
          </h1>
          <p className="text-accent text-sm font-medium mt-1">{t.admin.login.title}</p>
        </div>

        <div className="product-card p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-body text-sm font-semibold mb-1.5">
                {t.admin.login.email}
              </label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-body text-sm font-semibold mb-1.5">
                {t.admin.login.password}
              </label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm flex items-center gap-1.5">
                <AlertCircle size={14} />{error}
              </p>
            )}

            <button type="submit" className="btn-primary justify-center py-3 mt-1" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? '…' : t.admin.login.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
