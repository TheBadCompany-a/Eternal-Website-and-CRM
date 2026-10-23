import type { CrmSidebarItem } from '../types';
import type { RoleAccess } from '../lib/settings';

type Role = 'admin' | 'coordinator' | 'sales' | 'accounts' | 'hr' | 'operations' | 'driver' | 'backend_executive' | null | undefined;

export const DEFAULT_ROLE_ITEMS: Record<Exclude<Role, null | undefined>, CrmSidebarItem[]> = {
  admin: [
    'dashboard', 'arrangements', 'leads', 'stars', 'tributes', 'customers',
    'service-plans', 'configurator', 'quotations', 'bookings', 'operations',
    'driver-app', 'vehicles', 'team', 'hr', 'documents', 'records', 'payments',
    'communications', 'feedback', 'reports', 'settings'
  ],
  backend_executive: [
    'dashboard', 'arrangements', 'leads', 'stars', 'tributes', 'customers',
    'quotations', 'bookings', 'documents', 'records', 'payments', 'communications',
    'feedback', 'settings'
  ],
  driver: ['driver-app', 'vehicles', 'hr', 'settings'],
  operations: [
    'dashboard', 'arrangements', 'bookings', 'operations', 'driver-app',
    'vehicles', 'team', 'documents', 'communications', 'settings'
  ],
  accounts: [
    'dashboard', 'arrangements', 'quotations', 'bookings', 'documents',
    'payments', 'reports', 'settings'
  ],
  hr: [
    'dashboard', 'team', 'hr', 'records', 'reports', 'settings'
  ],
  coordinator: [
    'dashboard', 'arrangements', 'leads', 'stars', 'tributes', 'customers',
    'service-plans', 'configurator', 'quotations', 'bookings', 'operations',
    'documents', 'communications', 'feedback', 'reports', 'settings'
  ],
  sales: [
    'dashboard', 'arrangements', 'leads', 'stars', 'customers',
    'service-plans', 'configurator', 'quotations', 'bookings', 'communications', 'settings'
  ],
};

const DRIVER_ITEMS: CrmSidebarItem[] = ['driver-app', 'vehicles', 'hr', 'settings'];

/** The screens a role may open by default. */
export function defaultItems(role: Exclude<Role, null | undefined>, all: CrmSidebarItem[]): CrmSidebarItem[] {
  return DEFAULT_ROLE_ITEMS[role] ?? (role === 'driver' ? DRIVER_ITEMS : all);
}

export function canOpen(role: Role, item: CrmSidebarItem, saved?: RoleAccess): boolean {
  if (role === 'admin' || !role) return true;
  if (item === 'settings') return true; // everyone can reach their own settings
  const custom = saved?.[role];
  if (custom) return custom.includes(item);
  if (item === 'records') return role === 'hr' || role === 'backend_executive';
  return DEFAULT_ROLE_ITEMS[role]?.includes(item) ?? true;
}

export function homePath(role: Role, saved?: RoleAccess): string {
  if (role === 'driver') return '/crm/driver-app';
  const custom = role && role !== 'admin' ? saved?.[role] : undefined;
  if (custom && !custom.length) return '/crm/settings'; // nothing ticked: Settings is always allowed, so this can't loop
  if (custom && !custom.includes('dashboard')) return `/crm/${custom[0]}`;
  return '/crm/dashboard';
}
