import { jsPDF } from 'jspdf';
import type { Arrangement } from '../types';
import type { PaymentEntry } from '../data/usePaymentEntries';
import { loadLetterhead } from './quotationShare';
import { DEFAULT_SETTINGS, type AllSettings } from './settings';

const inr = (n: number) => n.toLocaleString('en-IN');
const when = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/** A payment receipt on the company letterhead, listing every payment made for the case. */
export async function downloadReceiptPdf(a: Arrangement, entries: PaymentEntry[], quoted: number, settings: AllSettings = DEFAULT_SETTINGS) {
  const letterhead = await loadLetterhead();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 58;
  const TOP = 152;
  const BOTTOM = H - 112;
  let y = TOP;
  const paint = () => doc.addImage(letterhead, 'PNG', 0, 0, W, H);
  const ensure = (needed: number) => {
    if (y + needed > BOTTOM) {
      doc.addPage();
      paint();
      y = TOP;
    }
  };
  paint();

  const paid = entries.reduce((s, e) => s + e.amount, 0);
  const balance = Math.max(0, quoted - paid);

  doc.setTextColor(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Payment Receipt', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Reference: ${a.id}`, W - M, y - 8, { align: 'right' });
  doc.text(`Date: ${when(new Date().toISOString())}`, W - M, y + 6, { align: 'right' });

  y += 32;
  doc.setTextColor(30);
  (
    [
      ['Received from', a.contactName || a.family],
      ['Phone', a.phone],
      ['Service', a.serviceType],
    ] as [string, string][]
  )
    .filter(([, v]) => v)
    .forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${k}:`, M, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(v), M + 96, y);
      y += 16;
    });

  y += 14;
  doc.setFillColor(245, 241, 232);
  doc.rect(M, y - 14, W - 2 * M, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Date', M + 8, y + 2);
  doc.text('Method', M + 100, y + 2);
  doc.text('Details', M + 190, y + 2);
  doc.text('Amount (Rs.)', W - M - 8, y + 2, { align: 'right' });
  y += 26;

  doc.setFont('helvetica', 'normal');
  [...entries].reverse().forEach((e) => {
    ensure(26);
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(when(e.createdAt), M + 8, y);
    doc.text(e.method, M + 100, y);
    doc.text(doc.splitTextToSize(e.note || '-', 190)[0] as string, M + 190, y);
    doc.text(inr(e.amount), W - M - 8, y, { align: 'right' });
    doc.setDrawColor(230);
    doc.line(M, y + 8, W - M, y + 8);
    y += 24;
  });

  ensure(120);
  y += 8;
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(30);
    doc.text(label, W - M - 200, y);
    doc.text(value, W - M - 8, y, { align: 'right' });
    y += bold ? 24 : 18;
  };
  if (quoted > 0) row('Total amount', `Rs. ${inr(quoted)}`);
  row('Total received', `Rs. ${inr(paid)}`, true);
  if (quoted > 0) row(balance > 0 ? 'Balance due' : 'Balance', balance > 0 ? `Rs. ${inr(balance)}` : 'Nil (paid in full)');

  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text('Thank you. This receipt confirms the payments received against the reference above.', M, y);
  doc.text('We are with you every step of the way.', M, y + 15);
  if (settings.business.gst) doc.text(`GST: ${settings.business.gst}`, M, y + 33);

  doc.save(`Receipt-${a.id}.pdf`);
}
