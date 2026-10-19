import { useState, type FormEvent } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { roleLabel } from '../../../auth/roles';
import { Modal } from '../../../modal/Modal';
import { useCreateStaffUser, useDeleteStaffUser, useProfiles, useUpdateStaffPhone, useUpdateProfileRole, type NewStaffInput } from '../../../data/useProfiles';
import { useToast } from '../../../toast/useToast';
import { StatusBadge } from '../StatusBadge';

const ROLES = ['admin', 'coordinator', 'sales', 'accounts', 'hr', 'operations', 'driver', 'backend_executive'] as const;

// Roles offered when adding a new person.
const NEW_USER_ROLES = ['coordinator', 'driver', 'hr', 'backend_executive'] as const;

const emptyStaff = (): NewStaffInput => ({ fullName: '', email: '', password: '', role: 'coordinator', phone: '' });

export function TeamScreen() {
  const { isAdmin, user } = useAuth();
  const profiles = useProfiles();
  const updateRole = useUpdateProfileRole();
  const { showToast } = useToast();
  const createStaff = useCreateStaffUser();
  const deleteStaff = useDeleteStaffUser();
  const updatePhone = useUpdateStaffPhone();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<NewStaffInput>(emptyStaff);
  const setField = (key: keyof NewStaffInput) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  const submitStaff = (e: FormEvent) => {
    e.preventDefault();
    createStaff.mutate(form, {
      onSuccess: () => {
        showToast(`${form.fullName} can now sign in as ${roleLabel(form.role)}.`, 'info');
        setForm(emptyStaff());
        setAdding(false);
      },
      onError: (err) => showToast(err.message, 'info'),
    });
  };

  const team = profiles.data ?? [];
  const onDuty = team.filter((member) => member.status === 'On Duty').length;
  const available = team.filter((member) => member.status === 'Available').length;
  const drivers = team.filter((member) => member.appRole === 'driver').length;

  return (
    <div className="crm-screen active">
      <div className="leads-kpis" style={{ marginBottom: 18 }}>
        <div><strong>{team.length}</strong><span>Total staff</span></div>
        <div><strong>{onDuty}</strong><span>On duty</span></div>
        <div><strong>{available}</strong><span>Available</span></div>
        <div><strong>{drivers}</strong><span>Driver app users</span></div>
      </div>
      <div className="crm-section-card">
        <div className="crm-card-header">
          <h3>Coordinators, Drivers & Field Crew ({team.length} Staff Members)</h3>
          {isAdmin ? (
            <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}>+ Add user</button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Only an admin can add users.</span>
          )}
        </div>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Job Title</th>
                <th>Shift Status</th>
                <th>Active Cases</th>
                <th>Phone Contact</th>
                <th>Access Role</th>
                {isAdmin && <th aria-label="Actions" />}
              </tr>
            </thead>
            <tbody>
              {team.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.code}</strong>
                  </td>
                  <td>
                    <strong>{t.name}</strong>
                    {t.id === user?.id && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)' }}> (you)</span>
                    )}
                  </td>
                  <td>{t.role}</td>
                  <td>
                    <StatusBadge status={t.status} />
                  </td>
                  <td>{t.activeCases} active</td>
                  <td>
                    {isAdmin ? (
                      <input
                        key={`${t.id}-${t.phone}`}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '4px 8px', width: 140 }}
                        type="tel"
                        defaultValue={t.phone}
                        placeholder="Add phone"
                        maxLength={20}
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          if (next === t.phone) return;
                          updatePhone.mutate(
                            { id: t.id, phone: next },
                            {
                              onSuccess: () => showToast(`Phone saved for ${t.name}.`, 'info'),
                              onError: (err) => showToast(err.message, 'info'),
                            },
                          );
                        }}
                      />
                    ) : (
                      t.phone
                    )}
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        className="form-select"
                        style={{ fontSize: '0.82rem', padding: '4px 8px' }}
                        value={t.appRole}
                        onChange={(e) =>
                          updateRole.mutate(
                            { id: t.id, appRole: e.target.value as typeof ROLES[number] },
                            {
                              onSuccess: () => showToast(`${t.name} is now ${e.target.value}.`, 'info'),
                              onError: () => showToast('Could not update role — please try again.', 'info'),
                            },
                          )
                        }
                      >
                        {ROLES.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
                      </select>
                    ) : (
                      <span className={`status-badge ${t.appRole === 'admin' ? 'status-confirmed' : 'status-inquiry'}`}>
                        {roleLabel(t.appRole)}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td>
                      {t.id !== user?.id && (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          style={{ color: 'var(--crimson-600)' }}
                          disabled={deleteStaff.isPending}
                          onClick={() => {
                            if (!window.confirm(`Delete ${t.name || 'this user'} (${roleLabel(t.appRole)})? They will no longer be able to sign in. Their past work stays in the records.`)) return;
                            deleteStaff.mutate(t.id, {
                              onSuccess: () => showToast(`${t.name || 'User'} was deleted.`, 'info'),
                              onError: (err) => showToast(err.message, 'info'),
                            });
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={adding}
        onClose={() => setAdding(false)}
        headerContent={<h3>Add user</h3>}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
            <button type="submit" form="add-user-form" className="btn btn-primary" disabled={createStaff.isPending}>
              {createStaff.isPending ? 'Creating…' : 'Create user'}
            </button>
          </>
        }
      >
        <form id="add-user-form" onSubmit={submitStaff}>
          <div className="form-group"><label className="form-label">Full name *</label>
            <input className="form-input" value={form.fullName} onChange={setField('fullName')} required maxLength={80} /></div>
          <div className="form-group"><label className="form-label">Role *</label>
            <select className="form-select" value={form.role} onChange={setField('role')}>
              {NEW_USER_ROLES.map((role) => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Email (their sign-in) *</label>
            <input className="form-input" type="email" value={form.email} onChange={setField('email')} required autoComplete="off" /></div>
          <div className="form-group"><label className="form-label">Phone</label>
            <input className="form-input" type="tel" value={form.phone} onChange={setField('phone')} maxLength={20} /></div>
          <div className="form-group"><label className="form-label">Temporary password * (at least 8 characters)</label>
            <input className="form-input" type="text" value={form.password} onChange={setField('password')} required minLength={8} autoComplete="off" /></div>
          <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
            Share the email and password with them yourself. They can sign in straight away.
          </p>
        </form>
      </Modal>
    </div>
  );
}
