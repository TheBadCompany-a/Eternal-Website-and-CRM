import { useMemo, useState } from 'react';
import { useSetTributeStatus, useTributes, type Tribute, type TributeStatus } from '../../../data/useWebsite';
import { useAppState } from '../../../state/useAppState';
import { useToast } from '../../../toast/useToast';

type View = 'pending' | 'approved' | 'rejected' | 'all';
const VIEW_LABELS: Record<View, string> = { pending: 'Waiting for approval', approved: 'Approved', rejected: 'Rejected', all: 'All' };

const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export function TributesScreen() {
  const [view, setView] = useState<View>('pending');
  const tributes = useTributes();
  const setStatus = useSetTributeStatus();
  const { searchFilter } = useAppState();
  const { showToast } = useToast();

  const all = tributes.data ?? [];
  const count = (s: TributeStatus) => all.filter((t) => t.status === s).length;

  const visible = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return all.filter((t) => {
      if (view !== 'all' && t.status !== view) return false;
      if (!query) return true;
      return [t.name, t.message, t.submitterName, t.submitterContact].join(' ').toLowerCase().includes(query);
    });
  }, [all, view, searchFilter]);

  const act = (t: Tribute, status: TributeStatus) =>
    setStatus.mutate(
      { id: t.id, status },
      {
        onSuccess: () => showToast(`${t.name}: ${status}.`, 'info'),
        onError: () => showToast('Could not update this tribute.', 'info'),
      },
    );

  return (
    <div className="crm-screen active">
      <section className="leads-hero">
        <div>
          <span className="leads-eyebrow">Name a Star · free tributes</span>
          <h3>Approve tributes before they appear in the sky.</h3>
          <p>Nothing shows on the website until you approve it. Approved tributes appear as stars on the Eternal Sky; rejected ones never do.</p>
        </div>
      </section>

      <div className="leads-kpis" aria-label="Tribute summary">
        <div><strong>{count('pending')}</strong><span>Waiting for approval</span></div>
        <div><strong>{count('approved')}</strong><span>Approved</span></div>
        <div><strong>{count('rejected')}</strong><span>Rejected</span></div>
        <div><strong>{all.length}</strong><span>Total tributes</span></div>
      </div>

      <section className="crm-section-card">
        <div className="crm-card-header leads-toolbar">
          <div>
            <h3>Tribute queue</h3>
            <p>Check the name and message, then approve or reject.</p>
          </div>
          <div className="lead-filter-tabs" role="tablist" aria-label="Tribute views">
            {(Object.keys(VIEW_LABELS) as View[]).map((key) => (
              <button className={view === key ? 'active' : ''} key={key} type="button" onClick={() => setView(key)}>
                {VIEW_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {tributes.isLoading ? (
          <p className="leads-empty">Loading tributes…</p>
        ) : tributes.isError ? (
          <p className="leads-empty">Tributes could not be loaded. Please refresh or check the database connection.</p>
        ) : visible.length === 0 ? (
          <p className="leads-empty">Nothing here right now.</p>
        ) : (
          <div className="crm-table-wrapper">
            <table className="crm-table leads-table">
              <thead>
                <tr><th>Tribute for</th><th>Message</th><th>Submitted by</th><th>Status</th><th>Received</th><th aria-label="Actions" /></tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.name}</strong>
                      <span>{[t.bornYear, t.passedYear].filter(Boolean).join(' – ') || '—'}</span>
                    </td>
                    <td style={{ maxWidth: 320 }}>{t.message || '—'}</td>
                    <td><strong>{t.submitterName}</strong><span>{t.submitterContact}</span></td>
                    <td><span className={`status-badge ${t.status === 'approved' ? 'status-confirmed' : t.status === 'pending' ? 'status-inquiry' : 'status-enroute'}`}>{t.status}</span></td>
                    <td>{fmt(t.createdAt)}</td>
                    <td>
                      {t.status !== 'approved' && <button className="btn btn-sm btn-primary" type="button" disabled={setStatus.isPending} onClick={() => act(t, 'approved')}>Approve</button>}
                      {t.status !== 'rejected' && <button className="btn btn-sm btn-secondary" type="button" disabled={setStatus.isPending} onClick={() => act(t, 'rejected')}>Reject</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
