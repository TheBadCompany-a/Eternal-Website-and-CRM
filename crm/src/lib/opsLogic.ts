import type { Arrangement, Vehicle } from '../types';
import type { DriverTaskView } from '../data/useDriverTasks';
import type { HrLeaveRequestRow } from '../data/database.types';

export const UNASSIGNED = 'To be assigned';
export const CHECKLIST_TOTAL = 8;
/** Two jobs closer together than this cannot share a driver or vehicle. */
const CLASH_HOURS = 4;

export type OpsColumn = 'assign' | 'ready' | 'transit' | 'done';
export const COLUMNS: { key: OpsColumn; title: string; hint: string }[] = [
  { key: 'assign', title: 'Needs a driver or vehicle', hint: 'Assign these first' },
  { key: 'ready', title: 'Ready', hint: 'Assigned, waiting for service time' },
  { key: 'transit', title: 'On the way', hint: 'Service under way' },
  { key: 'done', title: 'Completed', hint: 'Finished' },
];

export const isAssigned = (value: string) => Boolean(value) && value !== UNASSIGNED;
export const vehicleLabel = (v: Vehicle) => `${v.model} (${v.reg})`;

/** Service date and time as a real date. Understands "14:30" and "2:30 PM". */
export function serviceAt(a: Pick<Arrangement, 'date' | 'time'>): Date | null {
  if (!a.date) return null;
  const m = /(\d{1,2}):(\d{2})\s*(am|pm)?/i.exec(a.time ?? '');
  let h = m ? Number(m[1]) : 9;
  const min = m ? Number(m[2]) : 0;
  if (m?.[3]) {
    const pm = m[3].toLowerCase() === 'pm';
    if (pm && h < 12) h += 12;
    if (!pm && h === 12) h = 0;
  }
  const d = new Date(`${a.date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(h, min, 0, 0);
  return d;
}

export const timeLabel = (a: Pick<Arrangement, 'date' | 'time'>) => {
  const d = serviceAt(a);
  return d ? d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : a.time || '—';
};
export const dateLabel = (iso: string) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—');
export const checklistDone = (a: Arrangement) => Object.values(a.checklist).filter(Boolean).length;

/** Non-dispatch services (demonstrations, institutional enquiries, memorials) follow their own pipelines and do not require hearse/driver dispatch */
export const isNonDispatchService = (serviceType: string = '') => {
  const s = serviceType.toLowerCase();
  return (
    s.startsWith('book a star') ||
    s.includes('star tribute') ||
    s.includes('name a star') ||
    s.includes('demonstration') ||
    s.includes('demo') ||
    s.includes('institutional') ||
    s.includes('partnership')
  );
};

/** Cases that belong on the operations board. Enquiries that are not confirmed yet only show when asked for. Non-dispatch enquiries (demonstrations, institutional, stars) are routed to their own pipelines. */
export const isOpsCase = (a: Arrangement) =>
  !isNonDispatchService(a.serviceType) &&
  (a.status === 'Confirmed' || a.status === 'In Execution' || a.status === 'Completed');

export function columnOf(a: Arrangement, task?: DriverTaskView): OpsColumn {
  if (a.status === 'Completed' || task?.task.status === 'Completed') return 'done';
  const live = task && ['En route to pickup', 'Arrived', 'Picked up'].includes(task.task.status);
  if (a.status === 'In Execution' || a.fieldExecutionStage > 1 || live) return 'transit';
  if (!isAssigned(a.driver) || !isAssigned(a.vehicle)) return 'assign';
  return 'ready';
}

export const minutesUntil = (a: Arrangement, now = new Date()) => {
  const d = serviceAt(a);
  return d ? Math.round((d.getTime() - now.getTime()) / 60000) : null;
};
export function untilLabel(mins: number | null): string {
  if (mins === null) return '';
  const abs = Math.abs(mins);
  const text = abs >= 1440 ? `${Math.round(abs / 1440)} d` : abs >= 60 ? `${Math.floor(abs / 60)} h ${abs % 60} min` : `${abs} min`;
  return mins < 0 ? `${text} ago` : `in ${text}`;
}

export interface OpsContext {
  cases: Arrangement[];
  fleet: Vehicle[];
  /** Drivers who have a login: id and name. */
  drivers: { id: string; name: string }[];
  leave: HrLeaveRequestRow[];
}

const activeOnly = (a: Arrangement) => a.status !== 'Completed';
const clash = (a: Arrangement, b: Arrangement) => {
  const x = serviceAt(a);
  const y = serviceAt(b);
  return Boolean(x && y && Math.abs(x.getTime() - y.getTime()) < CLASH_HOURS * 3_600_000);
};

/** Why this driver cannot take this case, or null if they are free. */
export function driverConflict(name: string, a: Arrangement, ctx: OpsContext): string | null {
  const other = ctx.cases.find((c) => c.id !== a.id && activeOnly(c) && c.driver === name && clash(a, c));
  if (other) return `busy with ${other.id} at ${timeLabel(other)}`;
  const profile = ctx.drivers.find((d) => d.name === name);
  const onLeave = profile && ctx.leave.some((l) => l.profile_id === profile.id && l.status === 'Approved' && l.start_date <= a.date && l.end_date >= a.date);
  return onLeave ? 'on approved leave' : null;
}

/** Why this vehicle cannot be used for this case, or null if it is free. */
export function vehicleConflict(label: string, a: Arrangement, ctx: OpsContext): string | null {
  const v = ctx.fleet.find((x) => vehicleLabel(x) === label);
  if (v?.status === 'Under Maintenance') return 'under maintenance';
  const other = ctx.cases.find((c) => c.id !== a.id && activeOnly(c) && c.vehicle === label && clash(a, c));
  return other ? `busy with ${other.id} at ${timeLabel(other)}` : null;
}

/** The free driver with the lightest day, and the best free vehicle. */
export function suggest(a: Arrangement, ctx: OpsContext, driverNames: string[]) {
  const load = (name: string) => ctx.cases.filter((c) => c.driver === name && c.date === a.date && activeOnly(c)).length;
  const driver = driverNames.filter((n) => !driverConflict(n, a, ctx)).sort((x, y) => load(x) - load(y) || x.localeCompare(y))[0] ?? null;
  const wanted = a.services.join(' ').toLowerCase();
  const free = ctx.fleet.filter((v) => v.status !== 'Under Maintenance' && !vehicleConflict(vehicleLabel(v), a, ctx));
  const score = (v: Vehicle) => (wanted.includes(v.model.toLowerCase()) ? 2 : 0) + (v.status === 'Available' ? 1 : 0);
  const vehicle = [...free].sort((x, y) => score(y) - score(x))[0];
  return { driver, vehicle: vehicle ? vehicleLabel(vehicle) : null };
}

export interface OpsAlert {
  id: string;
  caseId: string;
  family: string;
  level: 'red' | 'amber';
  text: string;
}

export function buildAlerts(ctx: OpsContext, board: Map<string, DriverTaskView> | undefined, now = new Date()): OpsAlert[] {
  const out: OpsAlert[] = [];
  for (const a of ctx.cases) {
    if (!isOpsCase(a) || a.status === 'Completed') continue;
    const task = board?.get(a.id);
    const col = columnOf(a, task);
    if (col === 'done') continue;
    const mins = minutesUntil(a, now);
    const add = (key: string, level: 'red' | 'amber', text: string) => out.push({ id: `${a.id}-${key}`, caseId: a.id, family: a.family, level, text });
    const when = mins === null ? '' : ` (${untilLabel(mins)})`;

    if (col === 'assign' && mins !== null && mins < 180) {
      const missing = [!isAssigned(a.driver) && 'driver', !isAssigned(a.vehicle) && 'vehicle'].filter(Boolean).join(' and ');
      add('assign', 'red', `No ${missing} yet${when}`);
    }
    if (col !== 'transit') {
      if (isAssigned(a.driver)) {
        const c = driverConflict(a.driver, a, ctx);
        if (c) add('driver', 'red', `${a.driver} is ${c}`);
      }
      if (isAssigned(a.vehicle)) {
        const c = vehicleConflict(a.vehicle, a, ctx);
        if (c) add('vehicle', 'red', `${a.vehicle} is ${c}`);
      }
    }
    if (col === 'ready') {
      if (mins !== null && mins < -30) add('late', 'red', `Service time has passed and it has not started${when}`);
      if (mins !== null && mins < 120 && checklistDone(a) < CHECKLIST_TOTAL) add('check', 'amber', `Pre-service check ${checklistDone(a)}/${CHECKLIST_TOTAL} done${when}`);
      if (mins !== null && mins < 60 && (!task || task.task.status === 'Assigned')) add('checkin', 'amber', `Driver has not checked in for this job${when}`);
    }
    if (col === 'transit' && task?.lastFix) {
      const silent = Math.round((now.getTime() - new Date(task.lastFix.at).getTime()) / 60000);
      if (silent > 15) add('gps', 'amber', `No location update for ${silent} min`);
    }
  }
  return out.sort((x, y) => Number(y.level === 'red') - Number(x.level === 'red'));
}

/** Digits only, with 91 in front of a 10-digit Indian number. */
export const waLink = (phone: string, text: string) => {
  const digits = (phone || '').replace(/\D/g, '');
  const num = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
};

export type FamilyUpdate = 'assigned' | 'onway' | 'arrived' | 'completed';
export const FAMILY_UPDATES: { key: FamilyUpdate; label: string }[] = [
  { key: 'assigned', label: 'Driver assigned' },
  { key: 'onway', label: 'On the way' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'completed', label: 'Service completed' },
];

export function familyMessage(kind: FamilyUpdate, a: Arrangement, company: string, mapUrl?: string): string {
  const who = a.contactName || a.family;
  const driver = isAssigned(a.driver) ? a.driver : 'our driver';
  const vehicle = isAssigned(a.vehicle) ? a.vehicle : 'the vehicle';
  const lines: Record<FamilyUpdate, string> = {
    assigned: `Namaste ${who}. For arrangement ${a.id} on ${dateLabel(a.date)} at ${timeLabel(a)}, ${driver} will be with you in ${vehicle}. We are with you at every step.`,
    onway: `Namaste ${who}. ${driver} is on the way to ${a.pickupLocation}.${mapUrl ? ` You can see the location here: ${mapUrl}` : ''}`,
    arrived: `Namaste ${who}. ${driver} has reached ${a.pickupLocation}. Please call us if you need anything.`,
    completed: `Namaste ${who}. The service for arrangement ${a.id} has been completed with care. Please reach out any time if we can help further.`,
  };
  return `${lines[kind]}\n\n— ${company}`;
}

export const mapUrl = (fix: { latitude: number; longitude: number } | null | undefined) =>
  fix ? `https://www.google.com/maps?q=${fix.latitude},${fix.longitude}` : undefined;
