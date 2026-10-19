/** Builds a wa.me click-to-chat link. Bare 10-digit numbers are treated as Indian (+91). */
export function whatsappLink(phone: string, text: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
