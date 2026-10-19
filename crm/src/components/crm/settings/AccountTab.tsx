import { useEffect, useRef, useState } from 'react';
import { ThemePicker } from '../../../theme/ThemePicker';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useAuth } from '../../../auth/useAuth';
import { roleLabel } from '../../../auth/roles';
import { supabase } from '../../../lib/supabaseClient';
import { useUpdateMyPreferences, useUpdateOwnProfile } from '../../../data/useProfiles';
import { useToast } from '../../../toast/useToast';

const DUTY_STATUSES = ['On Duty', 'Available', 'Off Duty'];

type Prefs = { new_lead: boolean; follow_up: boolean; payment: boolean; assigned: boolean };
const DEFAULT_PREFS: Prefs = { new_lead: true, follow_up: true, payment: true, assigned: true };
const PREF_LABELS: { key: keyof Prefs; label: string; hint: string }[] = [
  { key: 'new_lead', label: 'A new lead arrives', hint: 'From any website form.' },
  { key: 'follow_up', label: 'A follow-up is due', hint: 'For leads assigned to me.' },
  { key: 'payment', label: 'A payment needs checking', hint: 'A UPI payment reported by a family, or a Razorpay payment.' },
  { key: 'assigned', label: 'A case is assigned to me', hint: 'When a coordinator is set on a lead.' },
];

export function AccountTab() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { showToast } = useToast();
  const updateProfile = useUpdateOwnProfile();
  const updatePrefs = useUpdateMyPreferences();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [duty, setDuty] = useState('Available');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  const extra = (profile ?? {}) as { notification_prefs?: Partial<Prefs>; language?: string; avatar_url?: string | null };
  const prefs: Prefs = { ...DEFAULT_PREFS, ...(extra.notification_prefs ?? {}) };
  const { lang, setLang } = useLanguage();

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name);
    setPhone(profile.phone ?? '');
    setJobTitle(profile.job_title);
    setDuty(profile.duty_status);
  }, [profile]);

  const saveProfile = () => {
    if (!user || !fullName.trim()) return showToast('Please enter your name.', 'info');
    updateProfile.mutate(
      { id: user.id, full_name: fullName.trim(), phone: phone.trim(), job_title: jobTitle.trim(), duty_status: duty },
      { onSuccess: async () => { await refreshProfile(); showToast('Profile saved.', 'info'); }, onError: () => showToast('Could not save your profile.', 'info') },
    );
  };

  const savePrefs = (changes: { notification_prefs?: Prefs; language?: string }) => {
    if (!user) return;
    updatePrefs.mutate(
      { id: user.id, changes },
      { onSuccess: () => void refreshProfile(), onError: () => showToast('Could not save this choice.', 'info') },
    );
  };

  const uploadPhoto = async (file: File | undefined) => {
    if (!file || !user) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return showToast('Please choose a JPG, PNG or WebP photo.', 'info');
    if (file.size > 2 * 1024 * 1024) return showToast('Please choose a photo under 2 MB.', 'info');
    setUploading(true);
    const path = `${user.id}/${Date.now()}.${file.type.split('/')[1]}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      setUploading(false);
      return showToast('Could not upload the photo.', 'info');
    }
    const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    updatePrefs.mutate(
      { id: user.id, changes: { avatar_url: url } },
      {
        onSuccess: async () => { await refreshProfile(); showToast('Photo updated.', 'info'); },
        onError: () => showToast('Could not save the photo.', 'info'),
        onSettled: () => setUploading(false),
      },
    );
  };

  const changePassword = async () => {
    if (newPassword.length < 8) return showToast('The password must be at least 8 characters.', 'info');
    if (newPassword !== confirmPassword) return showToast('The two passwords do not match.', 'info');
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) return showToast(error.message || 'Could not change the password.', 'info');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Your password has been changed.', 'info');
  };

  const signOutEverywhere = async () => {
    if (!window.confirm('Sign out on every phone and computer, including this one?')) return;
    await supabase.auth.signOut({ scope: 'global' });
  };

  const initials = (profile?.full_name || user?.email || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 18 }}>
      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header"><h3>My profile</h3></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          {extra.avatar_url ? (
            <img src={extra.avatar_url} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-delicate)' }} />
          ) : (
            <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-muted)' }}>{initials}</span>
          )}
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => void uploadPhoto(e.target.files?.[0])} />
            <button type="button" className="btn btn-sm btn-secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? 'Uploading…' : extra.avatar_url ? 'Change photo' : 'Add photo'}
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: 4 }}>JPG, PNG or WebP, up to 2 MB.</div>
          </div>
        </div>
        <div className="form-group"><label className="form-label">Full name</label><input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Job title</label><input className="form-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Duty status</label>
          <select className="form-select" value={duty} onChange={(e) => setDuty(e.target.value)}>{DUTY_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="mini-list" style={{ marginBottom: 12 }}>
          <div className="mini-row"><span>Email</span><strong>{user?.email}</strong></div>
          <div className="mini-row"><span>Access role</span><strong>{profile ? roleLabel(profile.app_role) : '—'}</strong></div>
        </div>
        <button className="btn btn-primary" type="button" disabled={updateProfile.isPending} onClick={saveProfile}>Save profile</button>
      </section>

      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header"><h3>Password and sign-in</h3></div>
        <div className="form-group"><label className="form-label">New password (at least 8 characters)</label>
          <input className="form-input" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Type it again</label>
          <input className="form-input" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div>
        <button className="btn btn-primary" type="button" disabled={savingPassword || !newPassword} onClick={() => void changePassword()}>
          {savingPassword ? 'Saving…' : 'Change password'}
        </button>
        <hr style={{ border: 0, borderTop: '1px solid var(--border-delicate)', margin: '20px 0' }} />
        <p className="comms-help">Lost a phone or left yourself signed in somewhere? This signs you out everywhere.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" type="button" onClick={() => void signOutEverywhere()}>Sign out of all devices</button>
          <button className="btn btn-secondary" type="button" onClick={() => void signOut()}>Sign out here</button>
        </div>
      </section>

      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header"><h3>Notifications</h3></div>
        <p className="comms-help">Tell me when… (shown on screen while the CRM is open)</p>
        {PREF_LABELS.map((p) => (
          <label key={p.key} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border-delicate)', cursor: 'pointer' }}>
            <input type="checkbox" checked={prefs[p.key]} onChange={(e) => savePrefs({ notification_prefs: { ...prefs, [p.key]: e.target.checked } })} style={{ marginTop: 3 }} />
            <span><strong style={{ fontSize: '0.9rem' }}>{p.label}</strong><br /><span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{p.hint}</span></span>
          </label>
        ))}
        <p className="comms-help" style={{ marginTop: 12 }}>
          Email and WhatsApp alerts are not switched on yet. They need a messaging service to be connected first.
        </p>
      </section>

      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header"><h3>Language</h3></div>
        <div className="form-group"><label className="form-label">Menu language</label>
          <select className="form-select" value={lang} onChange={(e) => { setLang(e.target.value as 'en' | 'hi'); savePrefs({ language: e.target.value }); }}>
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select></div>
        <p className="comms-help">This changes the language of the whole CRM. You can also switch it from the top of any screen.</p>
      </section>

      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header"><h3>Appearance</h3></div>
        <p className="comms-help" style={{ marginTop: 0, marginBottom: 12 }}>Pick the colours you like. It changes only how the CRM looks for you, on this device.</p>
        <ThemePicker withLabels />
      </section>
    </div>
  );
}
