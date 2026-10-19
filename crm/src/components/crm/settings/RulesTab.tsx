import { useState } from 'react';
import { useAppSettings } from '../../../data/useSettings';
import { Field, SettingCard } from './SettingCard';

const DAYS = [
  { n: 1, label: 'Mon' }, { n: 2, label: 'Tue' }, { n: 3, label: 'Wed' }, { n: 4, label: 'Thu' },
  { n: 5, label: 'Fri' }, { n: 6, label: 'Sat' }, { n: 0, label: 'Sun' },
];

export function RulesTab() {
  const { settings } = useAppSettings();
  const [newHoliday, setNewHoliday] = useState('');
  const [newCity, setNewCity] = useState({ name: '', code: '' });
  const [newService, setNewService] = useState('');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
      <SettingCard title="Lead rules" help="What happens to every new website lead." settingKey="lead_rules" value={settings.lead_rules}>
        {(d, set) => (
          <>
            <Field label="First call due within (hours)">
              <input className="form-input" type="number" min="0.5" step="0.5" value={d.first_call_hours} onChange={(e) => set({ first_call_hours: Math.max(0.5, Number(e.target.value) || 2) })} />
            </Field>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={d.auto_assign} onChange={(e) => set({ auto_assign: e.target.checked })} style={{ marginTop: 3 }} />
              <span><strong>Give new leads to a coordinator automatically</strong><br />
                <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>The coordinator with the fewest open cases gets the lead.</span></span>
            </label>
          </>
        )}
      </SettingCard>

      <SettingCard title="Working hours and holidays" help="A follow-up that would fall outside these hours moves to the next opening time." settingKey="hours" value={settings.hours}>
        {(d, set) => (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Opens"><input className="form-input" type="time" value={d.start} onChange={(e) => set({ start: e.target.value })} /></Field>
              <Field label="Closes"><input className="form-input" type="time" value={d.end} onChange={(e) => set({ end: e.target.value })} /></Field>
            </div>
            <Field label="Working days">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {DAYS.map((day) => (
                  <label key={day.n} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={d.days.includes(day.n)}
                      onChange={(e) => set({ days: e.target.checked ? [...d.days, day.n] : d.days.filter((x) => x !== day.n) })}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Holidays (no calls scheduled)">
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="date" value={newHoliday} onChange={(e) => setNewHoliday(e.target.value)} />
                <button type="button" className="btn btn-secondary" disabled={!newHoliday || d.holidays.includes(newHoliday)} onClick={() => { set({ holidays: [...d.holidays, newHoliday].sort() }); setNewHoliday(''); }}>Add</button>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {d.holidays.map((h) => (
                  <span key={h} className="status-badge status-inquiry">
                    {new Date(h).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                    <button type="button" aria-label={`Remove ${h}`} onClick={() => set({ holidays: d.holidays.filter((x) => x !== h) })} style={{ background: 'none', border: 0, cursor: 'pointer' }}>×</button>
                  </span>
                ))}
                {d.holidays.length === 0 && <span className="comms-help">No holidays added.</span>}
              </div>
            </Field>
          </>
        )}
      </SettingCard>

      <SettingCard title="Cities and codes" help="The 3-letter code in case IDs, such as ER-DEL-…" settingKey="lists" value={settings.lists}>
        {(d, set) => (
          <>
            <div className="crm-table-wrapper">
              <table className="crm-table">
                <thead><tr><th>City</th><th>Code</th><th aria-label="Remove" /></tr></thead>
                <tbody>
                  {d.cities.map((c) => (
                    <tr key={c.name}>
                      <td>{c.name}</td><td><code>{c.code}</code></td>
                      <td><button type="button" className="btn btn-sm btn-secondary" onClick={() => set({ cities: d.cities.filter((x) => x.name !== c.name) })}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px auto', gap: 8, marginTop: 10 }}>
              <input className="form-input" placeholder="City name" value={newCity.name} onChange={(e) => setNewCity({ ...newCity, name: e.target.value })} />
              <input className="form-input" placeholder="Code" maxLength={3} value={newCity.code} onChange={(e) => setNewCity({ ...newCity, code: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })} />
              <button type="button" className="btn btn-secondary" disabled={!newCity.name.trim() || newCity.code.length !== 3} onClick={() => { set({ cities: [...d.cities, { name: newCity.name.trim(), code: newCity.code }] }); setNewCity({ name: '', code: '' }); }}>Add</button>
            </div>
            <hr style={{ border: 0, borderTop: '1px solid var(--border-delicate)', margin: '18px 0' }} />
            <Field label="Service types offered when adding a lead by hand">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {d.services.map((s) => (
                  <span key={s} className="status-badge status-inquiry">{s}{' '}
                    <button type="button" aria-label={`Remove ${s}`} onClick={() => set({ services: d.services.filter((x) => x !== s) })} style={{ background: 'none', border: 0, cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="New service type" value={newService} onChange={(e) => setNewService(e.target.value)} />
                <button type="button" className="btn btn-secondary" disabled={!newService.trim() || d.services.includes(newService.trim())} onClick={() => { set({ services: [...d.services, newService.trim()] }); setNewService(''); }}>Add</button>
              </div>
            </Field>
          </>
        )}
      </SettingCard>

      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        <div className="crm-card-header"><h3>Fixed lists</h3></div>
        <p className="comms-help">These are built into the system and cannot be edited here.</p>
        <div className="mini-list">
          <div className="mini-row"><span>Lead sources</span><strong>Website, Google Ads, Meta Ads, WhatsApp, Referral, Walk-in, Other</strong></div>
          <div className="mini-row"><span>Case type codes</span><strong>IM, PL, TR, ST, PK, IN, EN</strong></div>
          <div className="mini-row"><span>Case stages</span><strong>New Inquiry to Completed (7)</strong></div>
        </div>
      </section>
    </div>
  );
}
