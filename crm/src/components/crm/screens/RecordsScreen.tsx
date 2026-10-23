import { useMemo, useRef, useState } from 'react';
import { useArrangements } from '../../../data/useArrangements';
import type { RecordCategoryRow } from '../../../data/database.types';
import { recordLink, useDeleteRecord, useRecords, useUploadRecord } from '../../../data/useRecords';
import { useProfiles } from '../../../data/useProfiles';
import { useToast } from '../../../toast/useToast';

const CATEGORIES: RecordCategoryRow[] = ['Case', 'HR', 'Vehicles', 'Legal', 'Finance', 'Other'];
const DOC_TYPES = [
  'Hospital death summary', 'Police NOC', 'Municipal death certificate', 'Family ID proof', 'Crematorium / cemetery slip',
  'Embassy clearance', 'Quotation', 'Receipt', 'Photo', 'Other',
];
const MAX_BYTES = 20 * 1024 * 1024;

const formatSize = (bytes: number) => (bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/** Every uploaded document, filed against a case or a general folder. HR and admin only. */
export function RecordsScreen() {
  const { showToast } = useToast();
  const records = useRecords();
  const arrangements = useArrangements();
  const profiles = useProfiles();
  const upload = useUploadRecord();
  const remove = useDeleteRecord();
  const fileInput = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RecordCategoryRow>('Case');
  const [docType, setDocType] = useState('Other');
  const [caseId, setCaseId] = useState('');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState<'All' | RecordCategoryRow>('All');
  const [search, setSearch] = useState('');

  const rows = records.data ?? [];
  const cases = arrangements.data ?? [];
  const nameOf = (id: string | null) => profiles.data?.find((p) => p.id === id)?.name ?? '—';
  const caseLabel = (id: string | null) => {
    const match = cases.find((a) => a.id === id);
    return match ? `${match.id} · ${match.family}` : id ?? '—';
  };

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => (filter === 'All' || r.category === filter) && (!q || [r.title, r.doc_type, r.file_name, r.arrangement_id ?? '', r.note].join(' ').toLowerCase().includes(q)));
  }, [rows, filter, search]);

  const reset = () => {
    setFile(null); setTitle(''); setDocType('Other'); setCaseId(''); setNote('');
    if (fileInput.current) fileInput.current.value = '';
  };

  const pick = (f: File | null) => {
    if (f && f.size > MAX_BYTES) {
      showToast('That file is larger than 20 MB.', 'info');
      return reset();
    }
    setFile(f);
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const save = () => {
    if (!file) return showToast('Choose a file first.', 'info');
    if (!title.trim()) return showToast('Give the record a title.', 'info');
    const arrangementId = category === 'Case' ? caseId.trim() : '';
    if (category === 'Case' && !cases.some((a) => a.id === arrangementId)) return showToast('Pick a case from the list, or choose another folder.', 'info');
    upload.mutate(
      { file, title: title.trim(), category, docType, arrangementId: arrangementId || null, note: note.trim() },
      {
        onSuccess: () => { reset(); showToast('Record saved.', 'info'); },
        onError: (err) => showToast(`Could not save: ${(err as { message?: string }).message ?? 'unknown error'}. Has supabase/033_records.sql been run?`, 'info'),
      },
    );
  };

  const open = async (path: string) => {
    try {
      window.open(await recordLink(path), '_blank', 'noopener');
    } catch {
      showToast('Could not open this file.', 'info');
    }
  };

  const del = (id: string) => {
    const record = rows.find((r) => r.id === id);
    if (!record || !window.confirm(`Delete "${record.title}"? The file is removed for good.`)) return;
    remove.mutate(record, { onSuccess: () => showToast('Record deleted.', 'info'), onError: () => showToast('Could not delete this record.', 'info') });
  };

  return (
    <div className="crm-screen active">
      <div className="leads-kpis" style={{ marginBottom: 18 }}>
        <div><strong>{rows.length}</strong><span>Total records</span></div>
        <div><strong>{rows.filter((r) => r.category === 'Case').length}</strong><span>Case files</span></div>
        <div><strong>{rows.filter((r) => r.category !== 'Case').length}</strong><span>General files</span></div>
      </div>

      {records.isError && (
        <div className="crm-section-card">
          <p className="comms-help">Records could not be loaded. Run <code>supabase/033_records.sql</code> in the Supabase SQL Editor, then refresh.</p>
        </div>
      )}

      <section className="crm-section-card">
        <div className="crm-card-header">
          <div>
            <h3>Add a record</h3>
            <p className="comms-help" style={{ margin: 0 }}>PDF, image, Word, Excel, CSV or text. Up to 20 MB. Only HR and admin can see records.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rec-file">File</label>
            <input id="rec-file" ref={fileInput} className="form-input" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rec-title">Title</label>
            <input id="rec-title" className="form-input" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Death summary — Sharma family" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rec-cat">Folder</label>
            <select id="rec-cat" className="form-select" value={category} onChange={(e) => setCategory(e.target.value as RecordCategoryRow)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'Case' ? 'Case (attach to a case)' : c}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="rec-type">Document type</label>
            <select id="rec-type" className="form-select" value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          {category === 'Case' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="rec-case">Case</label>
              <input id="rec-case" className="form-input" list="rec-cases" value={caseId} onChange={(e) => setCaseId(e.target.value)} placeholder="Start typing a reference or family" />
              <datalist id="rec-cases">{cases.map((a) => <option key={a.id} value={a.id}>{a.family}</option>)}</datalist>
            </div>
          )}
        </div>
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label" htmlFor="rec-note">Note (optional)</label>
          <input id="rec-note" className="form-input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="attribution-actions">
          <button type="button" className="btn btn-primary" disabled={upload.isPending} onClick={save}>{upload.isPending ? 'Uploading…' : 'Save record'}</button>
        </div>
      </section>

      <section className="crm-section-card">
        <div className="crm-card-header leads-toolbar">
          <div><h3>All records</h3></div>
          <input className="form-input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, file, case…" aria-label="Search records" style={{ maxWidth: 260 }} />
        </div>
        <div className="lead-filter-tabs" role="tablist" aria-label="Folders" style={{ marginBottom: 14 }}>
          {(['All', ...CATEGORIES] as const).map((f) => (
            <button key={f} type="button" role="tab" aria-selected={filter === f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f} ({f === 'All' ? rows.length : rows.filter((r) => r.category === f).length})
            </button>
          ))}
        </div>
        <div className="crm-table-wrapper">
          <table className="crm-table">
            <thead><tr><th>Title</th><th>Folder / case</th><th>File</th><th>Added</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {shown.length === 0 && <tr><td colSpan={5}>{records.isLoading ? 'Loading…' : rows.length === 0 ? 'No records yet. Add the first one above.' : 'No records match this view.'}</td></tr>}
              {shown.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.title}</strong><div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{r.doc_type}</div>{r.note && <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{r.note}</div>}</td>
                  <td>{r.category}{r.arrangement_id && <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{caseLabel(r.arrangement_id)}</div>}</td>
                  <td>{r.file_name}<div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{formatSize(r.size_bytes)}</div></td>
                  <td>{formatDate(r.created_at)}<div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{nameOf(r.uploaded_by)}</div></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => open(r.file_path)}>Open</button>{' '}
                    <button type="button" className="btn btn-sm btn-secondary" style={{ color: 'var(--crimson-600)' }} disabled={remove.isPending} onClick={() => del(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
