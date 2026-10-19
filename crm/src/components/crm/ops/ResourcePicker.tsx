import type { Arrangement } from '../../../types';
import { useAssignResources } from '../../../data/useArrangements';
import { useToast } from '../../../toast/useToast';
import { driverConflict, isAssigned, suggest, vehicleConflict, vehicleLabel, type OpsContext } from '../../../lib/opsLogic';

/** Driver and vehicle dropdowns that show who is free, plus a one-tap Suggest. */
export function ResourcePicker({ a, ctx, driverNames, compact }: { a: Arrangement; ctx: OpsContext; driverNames: string[]; compact?: boolean }) {
  const assign = useAssignResources();
  const { showToast } = useToast();
  const failed = () => showToast('Could not save this. Please try again.', 'info');

  const currentDriver = isAssigned(a.driver) ? a.driver : '';
  const currentVehicle = isAssigned(a.vehicle) ? a.vehicle : '';
  const vehicles = ctx.fleet.map(vehicleLabel);
  const withCurrent = (list: string[], cur: string) => (cur && !list.includes(cur) ? [cur, ...list] : list);
  const driverMsg = currentDriver ? driverConflict(currentDriver, a, ctx) : null;
  const vehicleMsg = currentVehicle ? vehicleConflict(currentVehicle, a, ctx) : null;

  const doSuggest = () => {
    const s = suggest(a, ctx, driverNames);
    const patch: { driver?: string; vehicle?: string } = {};
    if (!currentDriver && s.driver) patch.driver = s.driver;
    if (!currentVehicle && s.vehicle) patch.vehicle = s.vehicle;
    if (!patch.driver && !patch.vehicle) return showToast(currentDriver && currentVehicle ? 'Both are already chosen.' : 'No free driver or vehicle at this time.', 'info');
    assign.mutate({ id: a.id, ...patch }, {
      onSuccess: () => showToast(`Assigned ${[patch.driver, patch.vehicle].filter(Boolean).join(' and ')}.`, 'info'),
      onError: failed,
    });
  };

  const select = (value: string, options: string[], conflict: (o: string) => string | null, onChange: (v: string) => void, label: string) => (
    <select className="form-select" aria-label={label} style={{ fontSize: '0.85rem', width: '100%' }} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}…</option>
      {withCurrent(options, value).map((o) => {
        const why = o === value ? null : conflict(o);
        return <option key={o} value={o} disabled={Boolean(why)}>{why ? `${o} — ${why}` : o}</option>;
      })}
    </select>
  );

  return (
    <div style={{ display: 'grid', gap: compact ? 6 : 10 }}>
      {select(currentDriver, driverNames, (o) => driverConflict(o, a, ctx), (v) => assign.mutate({ id: a.id, driver: v || null }, { onError: failed }), 'Choose driver')}
      {select(currentVehicle, vehicles, (o) => vehicleConflict(o, a, ctx), (v) => assign.mutate({ id: a.id, vehicle: v || null }, { onError: failed }), 'Choose vehicle')}
      {(driverMsg || vehicleMsg) && (
        <div style={{ fontSize: '0.78rem', color: '#a33' }}>
          {driverMsg && <div>⚠ {currentDriver} is {driverMsg}.</div>}
          {vehicleMsg && <div>⚠ {currentVehicle} is {vehicleMsg}.</div>}
        </div>
      )}
      {(!currentDriver || !currentVehicle) && (
        <button type="button" className="btn btn-sm btn-secondary" disabled={assign.isPending} onClick={doSuggest}>✨ Suggest a free driver and vehicle</button>
      )}
    </div>
  );
}
