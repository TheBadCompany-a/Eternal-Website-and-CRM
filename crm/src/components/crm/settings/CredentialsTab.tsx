import { useEffect, useRef, useState } from 'react';
import { revealCredential, useCredentials, useDeleteCredential, useSaveCredential, useStaffLogins, type Credential, type CredentialInput } from '../../../data/useCredentials';
import { useToast } from '../../../toast/useToast';
import { Field } from './SettingCard';

const CATEGORIES = ['Website & hosting', 'Payment gateway', 'Staff login', 'Email', 'Social media', 'Supabase / database', 'Other'];
const EMPTY: CredentialInput = { name: '', category: CATEGORIES[0], username: '', url: '', notes: '', secret: '' };
const HIDE_AFTER_MS = 15_000;

export function CredentialsTab() {
  const { showToast } = useToast();
  const list = useCredentials();
  const save = useSaveCredential();
  const remove = useDeleteCredential();
  const [editing, setEditing] = useState<{ id?: string; input: CredentialInput } | null>(null);
  const [shown, setShown] = useState<{ id: string; value: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const hide = () => { window.clearTimeout(timer.current); setShown(null); };
  const reveal = async (c: Credential) => {
    try {
      const value = await revealCredential(c.id);
      setShown({ id: c.id, value });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setShown(null), HIDE_AFTER_MS);
    } catch {
      showToast('Could not open this credential.', 'info');
    }
  };
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); showToast('Copied.', 'info'); } catch { showToast('Could not copy. Select the text and copy it.', 'info'); }
  };
  const submit = () => {
    if (!editing) return;
    if (!editing.input.name.trim()) return showToast('Give this credential a name.', 'info');
    save.mutate(editing, {
      onSuccess: () => { showToast('Credential saved.', 'info'); setEditing(null); },
      onError: () => showToast('Could not save. Only an admin can do this.', 'info'),
    });
  };
  const patch = (p: Partial<CredentialInput>) => editing && setEditing({ ...editing, input: { ...editing.input, ...p } });
  const items = list.data ?? [];
  const staffSaved = items.filter((c) => c.category === 'Staff login');
  const others = items.filter((c) => c.category !== 'Staff login');
  const card = (c: Credential) => (
            <div key={c.id} style={{ border: '1px solid var(--border, #e5e0d8)', borderRadius: 10, padding: 14, display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <strong>{c.name} <span style={{ fontWeight: 400, opacity: 0.65 }}>· {c.category}</span></strong>
                <span style={{ opacity: 0.6, fontSize: 12 }}>Updated {new Date(c.updatedAt).toLocaleDateString('en-IN')}</span>
              </div>
              {c.username && <div>Username: <span style={{ userSelect: 'all' }}>{c.username}</span></div>}
              {c.url && <div><a href={/^https?:\/\//.test(c.url) ? c.url : `https://${c.url}`} target="_blank" rel="noreferrer noopener">{c.url}</a></div>}
              {c.notes && <div style={{ opacity: 0.8 }}>{c.notes}</div>}
              {c.hasSecret && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  Secret:{' '}
                  {shown?.id === c.id ? (
                    <>
                      <code style={{ userSelect: 'all', wordBreak: 'break-all' }}>{shown.value}</code>
                      <button className="btn btn-secondary" type="button" onClick={() => copy(shown.value)}>Copy</button>
                      <button className="btn btn-secondary" type="button" onClick={hide}>Hide</button>
                      <span style={{ opacity: 0.6, fontSize: 12 }}>hides itself in 15 seconds</span>
                    </>
                  ) : (
                    <>
                      <span>••••••••••</span>
                      <button className="btn btn-secondary" type="button" onClick={() => reveal(c)}>Show</button>
                    </>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn btn-secondary" type="button" onClick={() => setEditing({ id: c.id, input: { name: c.name, category: c.category, username: c.username ?? '', url: c.url ?? '', notes: c.notes ?? '', secret: '' } })}>Edit</button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  disabled={remove.isPending}
                  onClick={() => window.confirm(`Delete “${c.name}”? This cannot be undone.`) && remove.mutate(c.id, { onSuccess: () => { hide(); showToast('Credential deleted.', 'info'); }, onError: () => showToast('Could not delete.', 'info') })}
                >
                  Delete
                </button>
              </div>
            </div>
  );
  const logins = useStaffLogins();

  return (
    <div style={{ display: 'grid', gap: 18 }}>
    <section className="crm-section-card" style={{ marginBottom: 0 }}>
      <div className="crm-card-header">
        <div>
          <h3>Credentials</h3>
          <p className="comms-help" style={{ margin: 0 }}>
            Logins, API keys and tokens for the business. Only admins can see this page. Secrets are stored encrypted, and every time one is viewed it is recorded in the Activity log.
          </p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setEditing({ input: EMPTY })}>+ Add credential</button>
      </div>

      {list.isLoading ? (
        <p className="leads-empty">Loading…</p>
      ) : list.isError ? (
        <p className="leads-empty">Credentials could not be loaded.</p>
      ) : others.length === 0 ? (
        <p className="leads-empty">Nothing saved yet. Use “Add credential” to store your first one.</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {others.map(card)}
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 18, borderTop: '1px solid var(--border, #e5e0d8)', paddingTop: 16, display: 'grid', gap: 14 }}>
          <h4 style={{ margin: 0 }}>{editing.id ? 'Edit credential' : 'Add credential'}</h4>
          <Field label="Name">
            <input className="form-input" value={editing.input.name} onChange={(e) => patch({ name: e.target.value })} placeholder="e.g. Razorpay dashboard" />
          </Field>
          <Field label="Type">
            <select className="form-input" value={editing.input.category} onChange={(e) => patch({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Username / email">
            <input className="form-input" value={editing.input.username} onChange={(e) => patch({ username: e.target.value })} autoComplete="off" />
          </Field>
          <Field label="Link">
            <input className="form-input" value={editing.input.url} onChange={(e) => patch({ url: e.target.value })} placeholder="https://" />
          </Field>
          <Field label={editing.id ? 'Password / key (leave empty to keep the current one)' : 'Password / key / token'}>
            <input className="form-input" type="password" value={editing.input.secret} onChange={(e) => patch({ secret: e.target.value })} autoComplete="new-password" />
          </Field>
          <Field label="Notes">
            <textarea className="form-input" rows={2} value={editing.input.notes} onChange={(e) => patch({ notes: e.target.value })} />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" type="button" disabled={save.isPending} onClick={submit}>{save.isPending ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-secondary" type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </section>

    <section className="crm-section-card" style={{ marginBottom: 0 }}>
      <div className="crm-card-header">
        <div>
          <h3>Staff logins</h3>
          <p className="comms-help" style={{ margin: 0 }}>
            The sign-in email, role and login page for every team member. Passwords are stored scrambled and cannot be read by anyone, not even an admin; if someone forgets theirs, set a new one for them.
          </p>
        </div>
      </div>
      {staffSaved.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
          <h4 style={{ margin: 0 }}>Saved staff logins</h4>
          {staffSaved.map(card)}
        </div>
      )}
      {logins.isLoading ? (
        <p className="leads-empty">Loading…</p>
      ) : logins.isError ? (
        <p className="leads-empty">Staff logins could not be loaded.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="crm-table" style={{ width: '100%' }}>
            <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Login email</th><th>Login page</th><th>Last sign-in</th><th /></tr></thead>
            <tbody>
              {(logins.data ?? []).map((u) => {
                return (
                  <tr key={u.id}>
                    <td>{u.code}</td><td>{u.name}</td><td>{u.role.replace('_', ' ')}</td><td>{u.email}</td>
                    <td>{`${window.location.origin}/login`}</td>
                    <td>{u.lastSignIn ? new Date(u.lastSignIn).toLocaleString('en-IN') : 'Never'}</td>
                    <td><button className="btn btn-secondary" type="button" onClick={() => copy(u.email)}>Copy email</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
    </div>
  );
}
