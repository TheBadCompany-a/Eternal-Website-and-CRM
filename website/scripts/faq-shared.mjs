// Shared by the FAQ audio generators (ElevenLabs and local).
// KEEP `faqHash` AND `toSpeech` IN SYNC WITH src/utils/faqAudio.ts.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUT_DIR = path.join(root, 'public/audio/faq');
const DATA = path.join(root, 'src/data/servicesData.ts');

export const faqHash = (question, answer) => {
  const s = `${question}\n${answer}`;
  let h = 5381;
  for (const ch of s) h = ((h << 5) + h + ch.codePointAt(0)) >>> 0;
  return h.toString(36);
};

export const toSpeech = (text) =>
  text
    .replace(/\+91[\s-]*84486[\s-]*61338/g, 'plus nine one, eight four four eight six, six one three three eight')
    .replace(/24\s*[×x]\s*7/gi, 'twenty-four by seven')
    .replace(/\bNOC\b/g, 'N O C')
    .replace(/\s+/g, ' ')
    .trim();

export function loadFaqs() {
  const src = readFileSync(DATA, 'utf8');
  const start = src.indexOf('export const SERVICES_FAQS');
  if (start < 0) throw new Error('SERVICES_FAQS not found in servicesData.ts');
  const open = src.indexOf('[', src.indexOf('=', start));
  const end = src.indexOf('\n];', open);
  // The array is plain object literals, so it can be evaluated directly.
  return new Function(`return ${src.slice(open, end + 2)}`)();
}

// Optional: read KEY=VALUE pairs from .env.local (git-ignored) so a key never has to be typed on the command line.
export function loadEnvLocal() {
  try {
    const txt = readFileSync(path.join(root, '.env.local'), 'utf8');
    for (const line of txt.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  } catch {
    /* no .env.local */
  }
}
