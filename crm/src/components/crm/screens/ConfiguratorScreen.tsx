import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';
import { useArrangements } from '../../../data/useArrangements';
import { useCreatePackage, useServiceCatalog, useSetPackageServices, useSharedPackage, useUpdatePackage } from '../../../data/usePackages';
import { whatsappLink } from '../../../lib/whatsapp';
import { useToast } from '../../../toast/useToast';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export function ConfiguratorScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const arrangements = useArrangements();
  const catalog = useServiceCatalog();

  // The package is created on the first change so unused sessions leave no rows behind.
  const [token, setToken] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [leadReference, setLeadReference] = useState('');

  const pkg = useSharedPackage(token).data;
  const createPackage = useCreatePackage();
  const setServices = useSetPackageServices();
  const updatePackage = useUpdatePackage(token);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [leadSearch, setLeadSearch] = useState('');

  const lead = arrangements.data?.find((item) => item.id === leadReference);
  const customerName = lead?.contactName || lead?.family || 'Customer';
  const services = catalog.data ?? [];
  const selected = pkg?.selected ?? [];
  const status = pkg?.status ?? 'Draft';
  const total = pkg?.total ?? 0;
  const converted = status === 'Converted';
  const shared = status === 'Shared';
  const categories = useMemo(() => ['All', ...new Set(services.map((x) => x.category))], [services]);
  const query = search.trim().toLowerCase();
  const visible = services.filter((x) => (category === 'All' || x.category === category) && (!query || `${x.name} ${x.category}`.toLowerCase().includes(query)));
  const grouped = [...new Set(visible.map((x) => x.category))].map((c) => ({ category: c, items: visible.filter((x) => x.category === c) }));
  const leadQuery = leadSearch.trim().toLowerCase();
  const leadOptions = (arrangements.data ?? []).filter((item) => item.id === leadReference || !leadQuery || `${item.id} ${item.contactName} ${item.family} ${item.phone}`.toLowerCase().includes(leadQuery));
  const removeService = (key: string) => void toggle(key);
  const failed = () => showToast('Could not save the package — has supabase/008_shared_packages.sql been run?', 'info');

  useEffect(() => {
    if (!leadReference && arrangements.data?.length) setLeadReference(arrangements.data[0].id);
  }, [arrangements.data, leadReference]);

  const ensurePackage = async () => {
    if (token && packageId) return { token, id: packageId };
    if (!user) throw new Error('Not signed in');
    const created = await createPackage.mutateAsync({ arrangementId: leadReference, customerName, createdBy: user.id });
    setToken(created.token);
    setPackageId(created.id);
    return created;
  };

  const toggle = async (key: string) => {
    if (converted) return;
    try {
      const { token: activeToken } = await ensurePackage();
      const keys = selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key];
      await setServices.mutateAsync({ token: activeToken, keys });
    } catch {
      failed();
    }
  };

  const changeLead = (reference: string) => {
    setLeadReference(reference);
    const next = arrangements.data?.find((item) => item.id === reference);
    if (packageId) {
      updatePackage.mutate(
        { id: packageId, arrangement_id: reference, customer_name: next?.contactName || next?.family || 'Customer' },
        { onError: failed },
      );
    }
  };

  const share = async () => {
    try {
      const { token: activeToken, id } = await ensurePackage();
      await updatePackage.mutateAsync({ id, status: 'Shared' });
      await navigator.clipboard?.writeText(`${window.location.origin}/shared/${activeToken}`);
      showToast('Customer link copied. They can open it on any device.', 'info');
    } catch {
      failed();
    }
  };

  const sendViaWhatsApp = async () => {
    if (!lead) return;
    try {
      const { token: activeToken, id } = await ensurePackage();
      await updatePackage.mutateAsync({ id, status: 'Shared' });
      const text = `Namaste ${customerName}, please review and build your arrangement package with us here: ${window.location.origin}/shared/${activeToken}`;
      const link = whatsappLink(lead.phone, text);
      if (!link) return showToast('This lead has no valid phone number for WhatsApp.', 'info');
      window.open(link, '_blank', 'noopener');
    } catch {
      failed();
    }
  };

  const convert = () => {
    if (!packageId) return;
    updatePackage.mutate({ id: packageId, status: 'Converted' }, { onError: failed });
  };

  return (
    <div className="crm-screen active">
      <div className="config-bar">
        <div>
          <strong>Build a package</strong>
          <span>Tap services to add them. Send the family a link when ready.</span>
        </div>
        <div className="config-bar-total"><strong>{rupees(total)}</strong><small>{selected.length} added</small></div>
      </div>

      <div className="config-layout">
        <section className="crm-section-card config-main" style={{ marginBottom: 0 }}>
          <div className="config-pick">
            <div>
              <label className="comms-label">Family</label>
              <input className="comms-control" style={{ marginBottom: 6 }} placeholder="Search name or phone…" value={leadSearch} onChange={(e) => setLeadSearch(e.target.value)} />
              <select className="comms-control" aria-label="CRM lead reference" value={leadReference} onChange={(e) => changeLead(e.target.value)}>
                {leadOptions.map((item) => <option key={item.id} value={item.id}>{item.id} — {item.contactName || item.family}</option>)}
              </select>
              {leadQuery && leadOptions.length <= 1 && <p className="comms-help">No other family matches.</p>}
            </div>
            {lead && <div className="config-customer"><strong>{lead.contactName || lead.family}</strong><span>{lead.phone}</span></div>}
          </div>

          {catalog.isError && <p className="comms-help">Service catalog could not be loaded. Run <code>supabase/008_shared_packages.sql</code> in Supabase.</p>}
          <input className="comms-control" style={{ margin: '14px 0 8px' }} placeholder="Search services…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="config-chips" role="tablist" aria-label="Service groups">
            {categories.map((c) => {
              const picked = services.filter((x) => (c === 'All' || x.category === c) && selected.includes(x.key)).length;
              return (
                <button type="button" role="tab" aria-selected={category === c} key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>
                  {c}{picked ? ` · ${picked}` : ''}
                </button>
              );
            })}
          </div>
          {visible.length === 0 && !catalog.isLoading && <p className="leads-empty">No services match.</p>}
          {grouped.map((g) => (
            <div key={g.category} className="config-group">
              {category === 'All' && <h4>{g.category}</h4>}
              <div className="service-options">
                {g.items.map((service) => {
                  const active = selected.includes(service.key);
                  return (
                    <button className={active ? 'selected' : ''} onClick={() => void toggle(service.key)} disabled={converted} aria-pressed={active} type="button" key={service.key}>
                      <span className="svc-check" aria-hidden>{active ? '✓' : ''}</span>
                      <strong>{service.name}</strong>
                      <b>{rupees(service.price)}</b>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <aside className="crm-section-card config-summary" style={{ marginBottom: 0 }}>
          <div className="crm-card-header" style={{ marginBottom: 8 }}>
            <h3>Package</h3>
            <span className={`status-badge ${converted ? 'status-confirmed' : shared ? 'status-enroute' : 'status-inquiry'}`}>{status}</span>
          </div>
          <div className="config-items">
            {selected.length
              ? services.filter((item) => selected.includes(item.key)).map((item) => (
                  <div key={item.key}>
                    <span>{item.name}</span>
                    <strong>
                      {rupees(item.price)}
                      {!converted && <button type="button" className="config-remove" aria-label={`Remove ${item.name}`} onClick={() => removeService(item.key)}>✕</button>}
                    </strong>
                  </div>
                ))
              : <p>Add services to create a package.</p>}
          </div>
          <div className="config-grand-total"><span>Total</span><strong>{rupees(total)}</strong></div>
          <button className="btn btn-primary config-button" type="button" disabled={!selected.length || converted} onClick={convert}>
            {converted ? '✓ Converted to quotation' : 'Convert to quotation / booking'}
          </button>
          <button className="btn btn-secondary config-button" type="button" disabled={converted || !lead} onClick={() => void sendViaWhatsApp()}>
            Send link via WhatsApp ↗
          </button>
          <button className="btn btn-secondary config-button" type="button" disabled={converted || (!selected.length && !token)} onClick={() => void share()}>
            {shared ? '✓ Link shared · copy again' : 'Share customer view'}
          </button>
          {token && <button className="config-link" type="button" onClick={() => navigate(`/shared/${token}`)}>Open shared customer view →</button>}
          {token && <p className="config-session">Session {token.slice(0, 8).toUpperCase()}</p>}
        </aside>
      </div>
    </div>
  );
}
