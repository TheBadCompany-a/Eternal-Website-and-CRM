import { useAuth } from '../../../auth/useAuth';
import { useServiceCatalogAdmin, useUpdateService } from '../../../data/usePackages';
import { useToast } from '../../../toast/useToast';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

/** The service catalog the Sales Configurator sells from. Admins edit prices and availability. */
export function ServicePlansScreen() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const catalog = useServiceCatalogAdmin();
  const update = useUpdateService();
  const rows = catalog.data ?? [];

  const save = (id: string, changes: { unit_price?: number; active?: boolean }) =>
    update.mutate({ id, ...changes }, { onSuccess: () => showToast('Service updated.', 'info'), onError: () => showToast('Could not update — admins only.', 'info') });

  const categories = [...new Set(rows.map((row) => row.category))];

  return (
    <div className="crm-screen active">
      {catalog.isError && <div className="crm-section-card"><p className="comms-help">Catalog could not be loaded. Run <code>supabase/008_shared_packages.sql</code>.</p></div>}
      {categories.map((category) => (
        <div className="crm-section-card" key={category}>
          <div className="crm-card-header"><h3>{category}</h3>{!isAdmin && <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Only admins can change prices.</span>}</div>
          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead><tr><th>Service</th><th>Price</th><th>Offered in configurator</th></tr></thead>
              <tbody>
                {rows.filter((row) => row.category === category).map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.name}</strong></td>
                    <td>
                      {isAdmin ? (
                        <input
                          type="number" min="0" className="form-select" style={{ width: 120, padding: '4px 8px' }}
                          defaultValue={row.unit_price}
                          onBlur={(e) => { const value = Number(e.target.value); if (value >= 0 && value !== row.unit_price) save(row.id, { unit_price: value }); }}
                        />
                      ) : rupees(row.unit_price)}
                    </td>
                    <td>
                      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="checkbox" checked={row.active} disabled={!isAdmin} onChange={(e) => save(row.id, { active: e.target.checked })} />
                        {row.active ? 'Active' : 'Hidden'}
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
