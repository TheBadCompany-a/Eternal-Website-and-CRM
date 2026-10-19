import { useAuth } from '../../auth/useAuth';
import { TopbarDuty } from '../crm/TopbarDuty';
import { ThemePicker } from '../../theme/ThemePicker';
import { LanguageToggle } from '../../i18n/LanguageContext';

export function TopHeader() {
  const { session, profile, user, isAdmin, signOut } = useAuth();
  const role = profile?.app_role ? profile.app_role[0].toUpperCase() + profile.app_role.slice(1) : isAdmin ? 'Admin' : 'Coordinator';

  return (
    <header className="top-header">
      <div className="brand-section">
        <img src="/assets/logo.png" alt="Eternal Repos — Tribute in Motion" className="brand-logo-img" />
        <div className="brand-text">
          <h1>Eternal Repos</h1>
          <div className="tagline">Technology handles the coordination. People handle the care.</div>
        </div>
      </div>

      {session && (
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 14, marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <TopbarDuty />
          <LanguageToggle />
          <ThemePicker />
          {(profile as { avatar_url?: string | null } | null)?.avatar_url && (
            <img src={(profile as { avatar_url?: string | null }).avatar_url as string} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div style={{ textAlign: 'right', fontSize: '0.8rem', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600 }}>{profile?.full_name || user?.email}</div>
            <div style={{ color: 'var(--ink-muted)' }}>{role}</div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => void signOut()}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
