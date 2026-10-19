import { jsPDF } from 'jspdf';
import type { Arrangement, Quotation } from '../types';
import type { QuotationItem } from '../data/useQuotations';
import { DEFAULT_SETTINGS, type AllSettings } from './settings';

const LINES: { key: keyof Omit<Quotation, 'total' | 'status'>; label: string }[] = [
  { key: 'vehicle', label: 'Hearse / Vehicle' },
  { key: 'distance', label: 'Distance & Toll Charges' },
  { key: 'staff', label: 'Attendants & Staff' },
  { key: 'additionalServices', label: 'Additional Family Transportation' },
  { key: 'florals', label: 'Floral Garlands & Wreaths' },
  { key: 'rituals', label: 'Priest & Ritual Materials' },
  { key: 'waitingCharges', label: 'Waiting & Detention Charges' },
  { key: 'other', label: 'Other Expenses' },
];

const PHONE = '+91 84486 61338';

const inr = (n: number) => n.toLocaleString('en-IN');

/** Only the items that actually have a price. */
export function quotationItems(a: Arrangement, services: QuotationItem[] = []): { label: string; amount: number }[] {
  return [
    ...LINES.filter((l) => a.quotation[l.key] > 0).map((l) => ({ label: l.label, amount: a.quotation[l.key] })),
    ...services.map((i) => ({
      label: i.quantity > 1 ? `${i.label} x ${i.quantity}` : i.label,
      amount: i.unitPrice * i.quantity,
    })),
  ];
}

/** The WhatsApp message, built from the quotation template in Settings. */
export function quotationMessage(a: Arrangement, services: QuotationItem[] = [], settings: AllSettings = DEFAULT_SETTINGS): string {
  const items = quotationItems(a, services);
  const lines = items.length
    ? items.map((i) => `• ${i.label}${i.amount > 0 ? `: ₹${inr(i.amount)}` : ' (included)'}`).join('\n')
    : 'Our team will confirm the final items with you.';
  const tax = settings.quotation.tax_percent;
  const total = a.quotation.total + Math.round((a.quotation.total * tax) / 100);
  const fill: Record<string, string> = {
    name: a.contactName || a.family,
    ref: a.id,
    service: a.serviceType,
    items: tax > 0 ? `${lines}\n• Tax (${tax}%): ₹${inr(total - a.quotation.total)}` : lines,
    total: `₹${inr(total)}`,
    phone: settings.business.phone || PHONE,
    amount: `₹${inr(total)}`,
  };
  const text = settings.templates.quotation.replace(/\{(\w+)\}/g, (m, k: string) => fill[k] ?? m);
  const validity = settings.quotation.valid_days > 0 ? `\n\nThis quotation is valid for ${settings.quotation.valid_days} days.` : '';
  return text.replace(/\n{3,}/g, '\n\n') + validity;
}

let letterheadCache: Promise<string> | null = null;

/** The company letterhead (logo, contact details, footer), loaded once as an image. */
export function loadLetterhead(): Promise<string> {
  if (!letterheadCache) {
    letterheadCache = fetch('/assets/letterhead.png')
      .then((res) => {
        if (!res.ok) throw new Error('Letterhead not found');
        return res.blob();
      })
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Could not read the letterhead'));
            reader.readAsDataURL(blob);
          }),
      )
      .catch((err) => {
        letterheadCache = null;
        throw err;
      });
  }
  return letterheadCache;
}

/** A quotation PDF on the Eternal Repos letterhead, ready to download and attach in WhatsApp or email. */
export async function downloadQuotationPdf(a: Arrangement, services: QuotationItem[] = [], settings: AllSettings = DEFAULT_SETTINGS) {
  const letterhead = await loadLetterhead();
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 58;
  const TOP = 152; // below the letterhead logo and rule
  const BOTTOM = H - 112; // above the letterhead contact footer
  let y = TOP;

  const paintPage = () => doc.addImage(letterhead, 'PNG', 0, 0, W, H);
  const ensureSpace = (needed: number) => {
    if (y + needed > BOTTOM) {
      doc.addPage();
      paintPage();
      y = TOP;
    }
  };
  paintPage();

  doc.setTextColor(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Quotation', M, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`Reference: ${a.id}`, W - M, y - 8, { align: 'right' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, W - M, y + 6, { align: 'right' });

  y += 32;
  doc.setTextColor(30);
  const details = ([
    ['Prepared for', a.contactName || a.family],
    ['Phone', a.phone],
    ['Service', a.serviceType],
  ] as [string, string][]).filter(([, v]) => v);
  details.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, M, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(v), M + 90, y);
    y += 16;
  });

  y += 14;
  doc.setFillColor(245, 241, 232);
  doc.rect(M, y - 14, W - 2 * M, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Item', M + 8, y + 2);
  doc.text('Amount (Rs.)', W - M - 8, y + 2, { align: 'right' });
  y += 26;

  doc.setFont('helvetica', 'normal');
  const items = quotationItems(a, services);
  if (items.length === 0) {
    doc.setTextColor(110);
    doc.text('Items will be confirmed with you by our team.', M + 8, y);
    y += 22;
    doc.setTextColor(30);
  }
  items.forEach((i) => {
    ensureSpace(26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(i.label, M + 8, y);
    doc.text(i.amount > 0 ? inr(i.amount) : 'Included', W - M - 8, y, { align: 'right' });
    doc.setDrawColor(230);
    doc.line(M, y + 8, W - M, y + 8);
    y += 24;
  });

  ensureSpace(150);
  y += 6;
  const taxPercent = settings.quotation.tax_percent;
  const taxAmount = Math.round((a.quotation.total * taxPercent) / 100);
  if (taxPercent > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30);
    doc.text(`Tax (${taxPercent}%)`, M + 8, y);
    doc.text(inr(taxAmount), W - M - 8, y, { align: 'right' });
    y += 22;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30);
  doc.text('Total', M + 8, y);
  doc.text(`Rs. ${inr(a.quotation.total + taxAmount)}`, W - M - 8, y, { align: 'right' });

  y += 44;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text('Please call or message us to confirm this quotation or to change anything in it.', M, y);
  doc.text('Thank you for trusting Eternal Repos. We are with you every step of the way.', M, y + 15);
  y += 34;
  doc.setFontSize(9);
  if (settings.quotation.valid_days > 0) {
    doc.text(`This quotation is valid for ${settings.quotation.valid_days} days.`, M, y);
    y += 14;
  }
  if (settings.business.gst) {
    doc.text(`GST: ${settings.business.gst}`, M, y);
    y += 14;
  }
  if (settings.quotation.terms.trim()) {
    doc.splitTextToSize(settings.quotation.terms.trim(), W - 2 * M).forEach((line: string) => {
      ensureSpace(14);
      doc.text(line, M, y);
      y += 12;
    });
  }

  doc.save(`Quotation-${a.id}.pdf`);
}
