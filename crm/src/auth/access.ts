import type { CrmSidebarItem } from '../types';
import type { RoleAccess } from '../lib/settings';

type Role = 'admin' | 'coordinator' | 'sales' | 'accounts' | 'hr' | 'operations' | 'driver' | 'backend_executive' | null | undefined;

// Until an admin changes it in Settings: team members see every screen, drivers see only their own app,
// the fleet list and their settings. Admins always see everything.
const DRIVER_ITEMS: CrmSidebarItem[] = ['driver-app', 'vehicles', 'settings'];

/** The screens a role may open by default. */
export function defaultItems(role: Exclude<Role, null | undefined>, all: CrmSidebarItem[]): CrmSidebarItem[] {
  return role === 'driver' ? DRIVER_ITEMS : all;
}

export function canOpen(role: Role, item: CrmSidebarItem, saved?: RoleAccess): boolean {
  if (role === 'admin' || !role) return true;
  if (item === 'settings') return true; // everyone can reach their own settings
  const custom = saved?.[role];
  if (custom) return custom.includes(item);
  return role === 'driver' ? DRIVER_ITEMS.includes(item) : true;
}

export function homePath(role: Role, saved?: RoleAccess): string {
  if (role === 'driver') return '/crm/driver-app';
  const custom = role && role !== 'admin' ? saved?.[role] : undefined;
  if (custom && !custom.length) return '/crm/settings'; // nothing ticked: Settings is always allowed, so this can't loop
  if (custom && !custom.includes('dashboard')) return `/crm/${custom[0]}`;
  return '/crm/dashboard';
}
