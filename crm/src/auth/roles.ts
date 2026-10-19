import type { AppRoleRow } from '../data/database.types';

export const ROLE_LABELS: Record<AppRoleRow, string> = {
  admin: 'Admin',
  coordinator: 'Coordinator',
  sales: 'Sales',
  accounts: 'Accounts',
  hr: 'HR',
  operations: 'Operations',
  driver: 'Driver',
  backend_executive: 'Backend Executive',
};

export const roleLabel = (role: string) => ROLE_LABELS[role as AppRoleRow] ?? role;
