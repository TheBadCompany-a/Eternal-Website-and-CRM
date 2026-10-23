import { useState, useMemo } from 'react';
import { useArrangements } from '../../../data/useArrangements';
import { useProfiles } from '../../../data/useProfiles';
import {
  useFeedbackRecords,
  useSaveFeedbackRecord,
  useUpdateComplaintStatus,
  type BereavementFeedback,
} from '../../../data/useFeedbackRecords';
import { useToast } from '../../../toast/useToast';
import { Modal } from '../../../modal/Modal';

const CATEGORIES = [
  'Overall Bereavement Care',
  'Staff Courtesy & Empathy',
  'Hearse & Vehicle Condition',
  'Punctuality & Timeliness',
  'Ritual & Floral Execution',
  'Pricing & Documentation Transparency',
];

const STAR_LABELS: Record<number, string> = {
  1: '1 ★ — Critical Concern (Immediate Escalation)',
  2: '2 ★ — Below Standard (Investigation Required)',
  3: '3 ★ — Acceptable with reservations',
  4: '4 ★ — Dignified & Caring Service',
  5: '5 ★ — Exemplary Bereavement Support',
};

export function FeedbackScreen() {
  const { showToast } = useToast();
  const arrangements = useArrangements();
  const profiles = useProfiles();
  const feedbackQuery = useFeedbackRecords();
  const saveFeedback = useSaveFeedbackRecord();
  const updateComplaint = useUpdateComplaintStatus();

  const [tab, setTab] = useState<'all' | '5star' | 'complaints' | 'resolved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [comment, setComment] = useState('');
  const [assignedToId, setAssignedToId] = useState('');

  // Complaint edit resolution note modal/state
  const [resolvingItem, setResolvingItem] = useState<BereavementFeedback | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const cases = arrangements.data ?? [];
  const staff = (profiles.data ?? []).filter((p) => p.appRole !== 'driver');
  const allFeedback = feedbackQuery.data ?? [];

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  // KPIs
  const totalCount = allFeedback.length;
  const avgRating = totalCount > 0 ? (allFeedback.reduce((s, f) => s + f.rating, 0) / totalCount).toFixed(1) : '5.0';
  const satisfiedCount = allFeedback.filter((f) => f.rating >= 4).length;
  const satisfactionRate = totalCount > 0 ? Math.round((satisfiedCount / totalCount) * 100) : 100;
  const openComplaints = allFeedback.filter((f) => f.isComplaint && f.complaintStatus !== 'Resolved').length;

  const filtered = useMemo(() => {
    switch (tab) {
      case '5star':
        return allFeedback.filter((f) => f.rating === 5);
      case 'complaints':
        return allFeedback.filter((f) => f.isComplaint && f.complaintStatus !== 'Resolved');
      case 'resolved':
        return allFeedback.filter((f) => f.isComplaint && f.complaintStatus === 'Resolved');
      default:
        return allFeedback;
    }
  }, [allFeedback, tab]);

  const handleRecordFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) {
      return showToast('Please select a case reference.', 'info');
    }
    if (!comment.trim()) {
      return showToast('Please enter the family feedback comment.', 'info');
    }

    const assignedStaff = staff.find((s) => s.id === assignedToId);

    saveFeedback.mutate(
      {
        arrangementId: selectedCase.id,
        familyName: selectedCase.family,
        contactName: selectedCase.contactName,
        serviceType: selectedCase.serviceType,
        rating,
        category,
        comment: comment.trim(),
        isComplaint: rating <= 3,
        assignedToProfileId: assignedToId || null,
        assignedToName: assignedStaff?.name || (rating <= 3 ? 'Operations Lead' : '—'),
      },
      {
        onSuccess: (rec) => {
          showToast(
            rec.isComplaint
              ? `Feedback recorded. Complaint opened and assigned to ${rec.assignedToName} for follow-up.`
              : `Thank you. 5-Star feedback recorded for ${selectedCase.family}.`,
            'info',
          );
          setShowAddModal(false);
          setComment('');
          setRating(5);
          setSelectedCaseId('');
        },
        onError: () => showToast('Could not save feedback.', 'info'),
      },
    );
  };

  const handleStatusChange = (item: BereavementFeedback, newStatus: BereavementFeedback['complaintStatus']) => {
    if (newStatus === 'Resolved') {
      setResolvingItem(item);
      setResolutionNote(item.resolutionNotes || '');
      return;
    }

    updateComplaint.mutate(
      { feedbackId: item.id, status: newStatus },
      { onSuccess: () => showToast(`Complaint status updated to ${newStatus}.`, 'info') },
    );
  };

  const handleSaveResolution = () => {
    if (!resolvingItem) return;
    updateComplaint.mutate(
      {
        feedbackId: resolvingItem.id,
        status: 'Resolved',
        resolutionNotes: resolutionNote.trim(),
      },
      {
        onSuccess: () => {
          showToast(`Complaint for ${resolvingItem.familyName} marked as Resolved.`, 'info');
          setResolvingItem(null);
        },
      },
    );
  };

  return (
    <div className="crm-screen active">
      <section className="reports-hero">
        <div>
          <span>Care Quality & Bereavement Experience</span>
          <h3>Family Feedback & Complaint Follow-up</h3>
          <p>
            Listen to families, measure care standards, and immediately assign complaints to coordinators for compassionate resolution.
          </p>
        </div>
        <div>
          <button type="button" className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Record Family Feedback
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <div className="leads-kpis" style={{ marginBottom: 18 }}>
        <div>
          <strong>★ {avgRating} / 5.0</strong>
          <span>Average Care Rating</span>
        </div>
        <div>
          <strong>{totalCount}</strong>
          <span>Total Family Reviews</span>
        </div>
        <div>
          <strong>{satisfactionRate}%</strong>
          <span>Family Satisfaction Rate (4-5 ★)</span>
        </div>
        <div>
          <strong style={{ color: openComplaints > 0 ? 'var(--crimson-700)' : 'var(--moss-700)' }}>
            {openComplaints}
          </strong>
          <span>Active Complaints Needing Follow-up</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="lead-filter-tabs" role="tablist" aria-label="Feedback views" style={{ marginBottom: 16 }}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'all'}
          className={tab === 'all' ? 'active' : ''}
          onClick={() => setTab('all')}
        >
          All Feedback ({totalCount})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === '5star'}
          className={tab === '5star' ? 'active' : ''}
          onClick={() => setTab('5star')}
        >
          5-Star Tributes ({allFeedback.filter((f) => f.rating === 5).length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'complaints'}
          className={tab === 'complaints' ? 'active' : ''}
          onClick={() => setTab('complaints')}
        >
          Complaints & Escalations ({allFeedback.filter((f) => f.isComplaint && f.complaintStatus !== 'Resolved').length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'resolved'}
          className={tab === 'resolved' ? 'active' : ''}
          onClick={() => setTab('resolved')}
        >
          Resolved Cases ({allFeedback.filter((f) => f.isComplaint && f.complaintStatus === 'Resolved').length})
        </button>
      </div>

      {/* Feedback List */}
      <section className="crm-section-card" style={{ marginBottom: 0 }}>
        {filtered.length === 0 ? (
          <p className="leads-empty">No feedback records found in this category.</p>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {filtered.map((item) => {
              const isComplaint = item.isComplaint;
              return (
                <div
                  key={item.id}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: isComplaint && item.complaintStatus !== 'Resolved'
                      ? '1px solid var(--crimson-400, #e53e3e)'
                      : '1px solid var(--border-delicate)',
                    background: isComplaint && item.complaintStatus !== 'Resolved'
                      ? 'var(--crimson-50, #fff5f5)'
                      : 'var(--bg-card, #fff)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>
                        {item.familyName} · <span style={{ fontFamily: 'monospace' }}>{item.arrangementId}</span>
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
                        {item.serviceType} {item.contactName ? `· Contact: ${item.contactName}` : ''} · {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="status-badge status-inquiry">{item.category}</span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '1rem',
                          color: item.rating >= 4 ? 'var(--moss-700, #2f855a)' : 'var(--crimson-700, #c53030)',
                        }}
                      >
                        {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)} ({item.rating}/5)
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '8px 0 12px', fontSize: '0.92rem', fontStyle: 'italic', color: 'var(--ink-primary)' }}>
                    "{item.comment}"
                  </p>

                  {/* Complaint Resolution and Follow-up Bar */}
                  {isComplaint && (
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'var(--bg-sand, #f6f3ed)',
                        border: '1px solid var(--border-delicate)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                        fontSize: '0.85rem',
                      }}
                    >
                      <div>
                        <strong>Complaint Follow-up:</strong> Assigned to{' '}
                        <span style={{ fontWeight: 600, color: 'var(--ink-primary)' }}>
                          {item.assignedToName}
                        </span>
                        {item.resolutionNotes && (
                          <div style={{ color: 'var(--moss-800)', marginTop: 4 }}>
                            <em>Resolution:</em> {item.resolutionNotes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--ink-muted)' }}>Status:</span>
                        <select
                          className="form-select"
                          style={{ fontSize: '0.82rem', padding: '3px 8px' }}
                          value={item.complaintStatus}
                          onChange={(e) => handleStatusChange(item, e.target.value as BereavementFeedback['complaintStatus'])}
                        >
                          <option value="Open">Open</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Family Contacted">Family Contacted</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Record Feedback Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        headerContent={<h3>Record Bereavement Feedback</h3>}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button
              type="submit"
              form="record-feedback-form"
              className="btn btn-primary"
              disabled={saveFeedback.isPending}
            >
              {saveFeedback.isPending ? 'Saving…' : 'Save Feedback'}
            </button>
          </>
        }
      >
        <form id="record-feedback-form" onSubmit={handleRecordFeedback} style={{ display: 'grid', gap: 14, maxWidth: 540 }}>
          <p className="comms-help" style={{ margin: 0 }}>
            Record direct feedback received from the family by call, WhatsApp, or bereavement visit.
          </p>

          <div className="form-group">
            <label className="form-label">Case Reference *</label>
            <select
              className="form-select"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              required
            >
              <option value="">Select case reference…</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.family} ({c.serviceType})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Care Quality Rating *</label>
            <select
              className="form-select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {STAR_LABELS[r]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Aspect / Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Family's Words / Comments *</label>
            <textarea
              className="form-input"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share the family’s experience, comments on staff courtesy, vehicle arrival, or rituals…"
              required
            />
          </div>

          {/* Complaint assignment if rating is low */}
          {rating <= 3 && (
            <div
              style={{
                background: 'var(--crimson-50, #fff5f5)',
                border: '1px solid var(--crimson-300, #feb2b2)',
                borderRadius: 8,
                padding: '12px 14px',
              }}
            >
              <strong style={{ color: 'var(--crimson-700)', fontSize: '0.86rem' }}>
                ⚠ Care Concern Detected ({rating} Stars):
              </strong>
              <p style={{ margin: '4px 0 10px', fontSize: '0.8rem', color: 'var(--ink-secondary)' }}>
                This will be recorded as an active complaint. Assign a staff member to review and contact the family for follow-up.
              </p>

              <label className="form-label">Assign Complaint Follow-up To *</label>
              <select
                className="form-select"
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                required={rating <= 3}
              >
                <option value="">Select staff coordinator…</option>
                {staff.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>

      {/* Resolution Notes Modal */}
      <Modal
        isOpen={resolvingItem !== null}
        onClose={() => setResolvingItem(null)}
        headerContent={<h3>Resolve Complaint · {resolvingItem?.familyName}</h3>}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setResolvingItem(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!resolutionNote.trim() || updateComplaint.isPending}
              onClick={handleSaveResolution}
            >
              Mark as Resolved
            </button>
          </>
        }
      >
        <div style={{ maxWidth: 500 }}>
          <p className="comms-help" style={{ margin: 0, marginBottom: 14 }}>
            Record how this concern was investigated and resolved with the family.
          </p>
          <div className="form-group">
            <label className="form-label">Resolution Summary / Action Taken *</label>
            <textarea
              className="form-input"
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Spoke with the family, apologized for the 15-minute driver delay, provided complimentary floral tribute."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
