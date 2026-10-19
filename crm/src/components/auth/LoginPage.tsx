import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../auth/useAuth';
import { ThemePicker } from '../../theme/ThemePicker';
import { LanguageToggle } from '../../i18n/LanguageContext';
import { homePath } from '../../auth/access';

/** One sign-in for everyone. Type your staff ID (or email) and password; your own panel opens. */
export function LoginPage() {
  const { session, loading, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!loading && session && profile && !submitting) {
    const redirectTo = (location.state as { from?: Location })?.from?.pathname || homePath(profile.app_role);
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data, error: callError } = await supabase.functions.invoke('login-with-id', { body: { id: id.trim(), password } });
    const tokens = data as { access_token?: string; refresh_token?: string } | null;
    if (callError || !tokens?.access_token || !tokens.refresh_token) {
      setSubmitting(false);
      setError(
        callError && callError.name !== 'FunctionsHttpError'
          ? 'Cannot reach the server. Check your internet connection and try again.'
          : 'That ID or password is not correct. Please check and try again.',
      );
      return;
    }

    const { data: set, error: sessionError } = await supabase.auth.setSession({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
    if (sessionError || !set.user) {
      setSubmitting(false);
      setError('Could not sign you in. Please try again.');
      return;
    }
    const { data: row } = await supabase.from('profiles').select('app_role').eq('id', set.user.id).maybeSingle();
    setSubmitting(false);
    navigate(homePath(row?.app_role), { replace: true });
  };

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center', marginBottom: 12 }}><ThemePicker /><LanguageToggle /></div>
      <div className="concierge-card" style={{ padding: '40px 36px', minHeight: 'auto' }}>
        <div className="step-eyebrow">Internal Operations CRM</div>
        <h2 className="step-title" style={{ marginBottom: 6 }}>Sign In</h2>
        <p className="step-subtitle" style={{ marginBottom: 28 }}>Enter your ID and password. Your own panel will open.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label" htmlFor="login-id">Your ID</label>
            <input
              id="login-id"
              type="text"
              className="form-input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. ST-002"
              autoComplete="username"
              autoCapitalize="characters"
              autoFocus
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Your staff ID, or your email.</span>
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{ background: 'none', border: 0, padding: '6px 0 0', fontSize: '0.78rem', color: 'var(--ink-muted)', cursor: 'pointer' }}
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>

          {error && (
            <div role="alert" style={{ background: 'var(--crimson-100)', color: 'var(--crimson-600)', borderRadius: 8, padding: '10px 14px', fontSize: '0.85rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: 20, textAlign: 'center' }}>
          Don’t know your ID or forgot your password? Ask an admin.
        </p>
      </div>
    </main>
  );
}
