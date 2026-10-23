import { useAuth } from '../../../auth/useAuth';
import { useNavigate } from 'react-router-dom';
import { useReadyPackages, useServiceCatalogAdmin, useUpdateService } from '../../../data/usePackages';
import { useToast } from '../../../toast/useToast';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

/** The service catalog the Sales Configurator sells from. Admins edit prices and availability. */
export function ServicePlansScreen() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const ready = useReadyPackages();
  const catalog = useServiceCatalogAdmin();
  const update = useUpdateService();
  const rows = catalog.data ?? [];

  const save = (id: string, changes: { unit_price?: number; active?: boolean }) =>
    update.mutate({ id, ...changes }, { onSuccess: () => showToast('Service updated.', 'info'), onError: () => showToast('Could not update — admins only.', 'info') });

  const categories = [...new Set(rows.map((row) => row.category))];

  return (
    <div className="crm-screen active">
      {catalog.isError && <div className="crm-section-card"><p className="comms-help">Catalog could not be loaded. Run <code>supabase/008_shared_packages.sql</code>.</p></div>}
      <section className="crm-section-card">
        <div className="crm-card-header">
          <div>
            <h3>Ready-made packages</h3>
            <p className="comms-help" style={{ margin: 0 }}>The same three packages as the website. Each price is the total of its services below, so changing a price updates the package.</p>
          </div>
        </div>
        {ready.isError && <p className="comms-help">Packages could not be loaded. Run <code>supabase/036_farewell_packages.sql</code>.</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
          {ready.data.map((pkg) => (
            <div key={pkg.key} style={{ border: pkg.highlighted ? '2px solid var(--moss-700, #3c5a3c)' : '1px solid var(--border-delicate)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: 0 }}>{pkg.name}</h4>
              <p className="comms-help" style={{ margin: '4px 0 10px' }}>{pkg.tagline}</p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: '0.85rem', flex: 1 }}>
                {pkg.items.map((item) => (
                  <li key={item.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border-delicate)' }}>
                    <span>{item.name}</span><span>{rupees(item.price)}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
                <span>Total</span><strong style={{ fontSize: '1.1rem' }}>{rupees(pkg.total)}</strong>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => navigate(`/crm/configurator?package=${pkg.key}`)}>Give to a customer</button>
            </div>
          ))}
        </div>
      </section>
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
