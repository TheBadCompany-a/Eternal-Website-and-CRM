import { useParams } from 'react-router-dom';
import { useSetPackageServices, useSharedPackage } from '../../../data/usePackages';

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function SharedConfiguratorScreen() {
  const { token = '' } = useParams();
  const validToken = UUID.test(token) ? token : null;
  const { data: pkg, isLoading, isError } = useSharedPackage(validToken);
  const setServices = useSetPackageServices();

  if (isLoading) return <main className="shared-page"><section className="shared-card"><p>Loading your package…</p></section></main>;

  if (!validToken || isError || !pkg) {
    return (
      <main className="shared-page">
        <section className="shared-card">
          <h1>Package session not found</h1>
          <p>Please ask your sales coordinator for a fresh shared link.</p>
        </section>
      </main>
    );
  }

  const locked = pkg.status === 'Accepted' || pkg.status === 'Converted';
  const toggle = (key: string) => {
    if (locked) return;
    const keys = pkg.selected.includes(key) ? pkg.selected.filter((item) => item !== key) : [...pkg.selected, key];
    setServices.mutate({ token: validToken, keys });
  };

  return (
    <main className="shared-page">
      <section className="shared-card">
        <span>ETERNAL REPOS · LIVE PACKAGE SESSION</span>
        <h1>Let’s build your arrangement package together.</h1>
        <p>Your coordinator and you see changes to this package in real time.</p>
        <div className="shared-summary">
          <strong>{pkg.customer_name}</strong>
          <span>Reference: {pkg.lead_reference || 'Pending assignment'}</span>
        </div>
        <div className="shared-services">
          {pkg.catalog.map((service) => {
            const selected = pkg.selected.includes(service.key);
            return (
              <button type="button" className={selected ? 'selected' : ''} disabled={locked || setServices.isPending} onClick={() => toggle(service.key)} key={service.key}>
                <span><strong>{service.name}</strong><small>{service.category}</small></span>
                <b>{selected ? '✓ Selected' : rupees(service.price)}</b>
              </button>
            );
          })}
        </div>
        <div className="shared-total"><span>Current package total</span><strong>{rupees(pkg.total)}</strong></div>
        {setServices.isError && <p className="shared-footnote">Could not save your change. Please try again.</p>}
        <p className="shared-footnote">
          {locked
            ? 'This package has been finalised by your coordinator.'
            : 'Your selection is shared with your coordinator. They will confirm availability, final pricing and payment before a booking is created.'}
        </p>
      </section>
    </main>
  );
}
