import { useState } from 'react';
import { useAuth } from '../../../auth/useAuth';
import { AccountTab } from '../settings/AccountTab';
import { CompanyTab } from '../settings/CompanyTab';
import { RulesTab } from '../settings/RulesTab';
import { AccessTab } from '../settings/AccessTab';
import { ActivityTab } from '../settings/ActivityTab';
import { CredentialsTab } from '../settings/CredentialsTab';

type Tab = 'account' | 'company' | 'rules' | 'access' | 'activity' | 'credentials';

/** Everyone sees "My account". Admins also get company details, rules, access and the activity log. */
export function SettingsScreen() {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>('account');
  const tabs: { key: Tab; label: string; adminOnly?: boolean }[] = [
    { key: 'account', label: 'My account' },
    { key: 'company', label: 'Company & messages', adminOnly: true },
    { key: 'rules', label: 'Rules & lists', adminOnly: true },
    { key: 'access', label: 'Who sees what', adminOnly: true },
    { key: 'activity', label: 'Activity & data', adminOnly: true },
    { key: 'credentials', label: 'Credentials', adminOnly: true },
  ];
  const visible = tabs.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className="crm-screen active">
      {visible.length > 1 && (
        <div className="lead-filter-tabs" role="tablist" aria-label="Settings sections" style={{ marginBottom: 18 }}>
          {visible.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {tab === 'account' && <AccountTab />}
      {isAdmin && tab === 'company' && <CompanyTab />}
      {isAdmin && tab === 'rules' && <RulesTab />}
      {isAdmin && tab === 'access' && <AccessTab />}
      {isAdmin && tab === 'activity' && <ActivityTab />}
      {isAdmin && tab === 'credentials' && <CredentialsTab />}
    </div>
  );
}
