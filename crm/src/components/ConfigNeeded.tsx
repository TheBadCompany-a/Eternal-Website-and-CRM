export function ConfigNeeded() {
  return (
    <main style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
      <div className="concierge-card" style={{ padding: '40px 36px', minHeight: 'auto' }}>
        <div className="step-eyebrow" style={{ background: 'var(--amber-100)', color: 'var(--amber-700)' }}>
          Setup Needed
        </div>
        <h2 className="step-title" style={{ marginBottom: 6 }}>
          Connect a Supabase project
        </h2>
        <p className="step-subtitle" style={{ marginBottom: 20 }}>
          This app needs a Supabase project's URL and anon key before it can run.
        </p>

        <ol style={{ fontSize: '0.9rem', color: 'var(--ink-secondary)', lineHeight: 1.8, paddingLeft: 20 }}>
          <li>
            Create a new Supabase project, then run <code>supabase/001_schema.sql</code>,{' '}
            <code>002_functions_triggers.sql</code>, and <code>003_rls_policies.sql</code> — in that order — in its
            SQL Editor.
          </li>
          <li>
            Copy <code>.env.local.example</code> to <code>.env.local</code> and fill in your project's URL and anon
            key from Project Settings → API.
          </li>
          <li>Restart the dev server.</li>
          <li>
            Create your own login via Supabase Dashboard → Authentication → Add User, then run{' '}
            <code>supabase/004_bootstrap_admin.sql.example</code> to make yourself an admin.
          </li>
        </ol>
      </div>
    </main>
  );
}
