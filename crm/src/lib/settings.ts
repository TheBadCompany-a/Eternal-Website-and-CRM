// Shapes and defaults of the settings stored in app_settings (migration 026).
import type { CrmSidebarItem } from '../types';

export interface BusinessSettings {
  company_name: string;
  tagline: string;
  legal_name: string;
  address: string;
  phone: string;
  email: string;
  gst: string;
  emergency_line: string;
}
export interface QuotationSettings {
  valid_days: number;
  terms: string;
  tax_percent: number;
}
export interface PaymentSettings {
  upi_id: string;
  upi_name: string;
  bank_details: string;
}
export interface TemplateSettings {
  quotation: string;
  new_lead: string;
  payment_received: string;
  feedback: string;
  payment_reminder: string;
}
export interface LeadRules {
  first_call_hours: number;
  auto_assign: boolean;
}
export interface ListSettings {
  cities: { name: string; code: string }[];
  services: string[];
}
export interface HoursSettings {
  start: string;
  end: string;
  days: number[];
  holidays: string[];
}
export type RoleAccess = Record<string, CrmSidebarItem[]>;

export interface AllSettings {
  business: BusinessSettings;
  quotation: QuotationSettings;
  payment: PaymentSettings;
  templates: TemplateSettings;
  lead_rules: LeadRules;
  lists: ListSettings;
  hours: HoursSettings;
  role_access: RoleAccess;
  retention: { note: string };
}

export const DEFAULT_SETTINGS: AllSettings = {
  business: {
    company_name: 'Eternal Repos',
    tagline: 'Tribute in Motion',
    legal_name: 'Consurgo Ventures Pvt. Ltd.',
    address: '',
    phone: '+91 84486 61338',
    email: 'care@eternalrepos.com',
    gst: '',
    emergency_line: '1800-200-8899',
  },
  quotation: { valid_days: 0, terms: '', tax_percent: 0 },
  payment: { upi_id: 'eternalrepos@icici', upi_name: 'Eternal Repos', bank_details: '' },
  templates: {
    quotation:
      'Hello {name},\n\nHere is your quotation from Eternal Repos (Ref: {ref}).\nService: {service}\n\n{items}\n\n*Total: {total}*\n\nPlease reply here or call us on {phone} to confirm or ask anything. We are with you every step of the way.',
    new_lead: 'Hello {name}, thank you for reaching out to Eternal Repos. A member of our care team will call you shortly. Your reference is {ref}.',
    payment_received: 'Hello {name}, we have received your payment of {amount} for {ref}. Thank you. We are with you every step of the way.',
    payment_reminder: 'Hello {name}, a gentle reminder from Eternal Repos: {balance} is still pending for {ref} (total {total}). You can pay by UPI to {upi}. Please call us on {phone} if you have any questions.',
    feedback: 'Hello {name}, we hope we were able to support your family well. Would you share a few words about your experience with us? Your reference: {ref}.',
  },
  lead_rules: { first_call_hours: 2, auto_assign: false },
  lists: { cities: [], services: [] },
  hours: { start: '09:00', end: '19:00', days: [1, 2, 3, 4, 5, 6], holidays: [] },
  role_access: {},
  retention: { note: '' },
};

/** Fill a saved value with the defaults for anything missing. */
export function withDefaults<K extends keyof AllSettings>(key: K, saved: unknown): AllSettings[K] {
  const base = DEFAULT_SETTINGS[key];
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) return { ...(base as object), ...(saved as object) } as AllSettings[K];
  return base;
}

/** Every screen a person with this role may open. Admins always see all; drivers see only their own. */
export const SCREEN_LABELS: { key: CrmSidebarItem; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'arrangements', label: 'Arrangements' },
  { key: 'leads', label: 'Leads' },
  { key: 'stars', label: 'Stars' },
  { key: 'tributes', label: 'Name a Star' },
  { key: 'customers', label: 'Customers' },
  { key: 'service-plans', label: 'Service Plans' },
  { key: 'configurator', label: 'Sales Configurator' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'operations', label: 'Operations' },
  { key: 'driver-app', label: 'Driver App' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'team', label: 'Drivers & Teams' },
  { key: 'hr', label: 'HR Overview' },
  { key: 'documents', label: 'Documents' },
  { key: 'payments', label: 'Payments' },
  { key: 'communications', label: 'Communications' },
  { key: 'feedback', label: 'Feedback' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
];
