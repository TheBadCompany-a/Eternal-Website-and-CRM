#!/usr/bin/env node
// Records every services-page FAQ answer with a macOS voice (no account or API key needed).
// Files go to public/audio/faq/ as .m4a and are picked up by the Voice FAQ automatically.
//
//   npm run faq:audio:local                      # uses Samantha
//   npm run faq:audio:local -- --voice Tessa     # any voice from `say -v '?'`
//   npm run faq:audio:local -- --force           # redo existing files
//
// Recordings from ElevenLabs (.mp3, npm run faq:audio) take priority over these when present.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { OUT_DIR, faqHash, toSpeech, loadFaqs } from './faq-shared.mjs';

const argv = process.argv.slice(2);
const FORCE = argv.includes('--force');
const vi = argv.indexOf('--voice');
const VOICE = vi >= 0 ? argv[vi + 1] : 'Samantha';
const RATE = 150; // words per minute. The default is ~175, slower reads as calmer.

if (process.platform !== 'darwin') {
  console.error('This generator needs macOS (it uses the built-in `say` voices).');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const faqs = loadFaqs();
let made = 0;
for (const f of faqs) {
  const file = path.join(OUT_DIR, `faq-${faqHash(f.question, f.answer)}.m4a`);
  if (existsSync(file) && !FORCE) {
    console.log(`have  ${path.basename(file)}`);
    continue;
  }
  // A soft pause between the question and its answer.
  const text = `${f.question.replace(/\?*$/, '?')} [[slnc 600]] ${toSpeech(f.answer)}`;
  const txt = path.join(tmpdir(), `faq-${Date.now()}.txt`);
  const aiff = path.join(tmpdir(), `faq-${Date.now()}.aiff`);
  writeFileSync(txt, text);
  try {
    execFileSync('say', ['-v', VOICE, '-r', String(RATE), '-o', aiff, '-f', txt]);
    execFileSync('afconvert', [aiff, file, '-f', 'm4af', '-d', 'aac', '-b', '64000', '-c', '1']);
  } finally {
    rmSync(txt, { force: true });
    rmSync(aiff, { force: true });
  }
  console.log(`made  ${path.basename(file)}  (${Math.round(statSync(file).size / 1024)} KB)  ${f.question}`);
  made++;
}
console.log(`\nDone: ${made} recorded with "${VOICE}". Reload the services page and press Listen.`);
