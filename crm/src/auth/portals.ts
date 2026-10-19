import type { AppRoleRow } from '../data/database.types';

// One sign-in page per kind of person. Each page only lets its own roles in.
export interface Portal {
  slug: string;
  label: string;
  blurb: string;
  roles: AppRoleRow[];
}

export const PORTALS: Portal[] = [
  { slug: 'admin', label: 'Admin', blurb: 'Full control: leads, quotes, payments, team and settings.', roles: ['admin'] },
  { slug: 'coordinator', label: 'Coordinator', blurb: 'Leads, quotations, bookings and customers.', roles: ['coordinator', 'sales', 'accounts', 'operations'] },
  { slug: 'driver', label: 'Driver', blurb: 'Today\'s tasks, check-in and check-out, expenses.', roles: ['driver'] },
  { slug: 'hr', label: 'HR', blurb: 'Attendance, leave and team strength.', roles: ['hr'] },
  { slug: 'backend-executive', label: 'Backend Executive', blurb: 'Back-office work: records, payments and documents.', roles: ['backend_executive'] },
];

export const findPortal = (slug: string | undefined) => PORTALS.find((p) => p.slug === slug);
