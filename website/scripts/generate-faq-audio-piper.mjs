#!/usr/bin/env node
// Records every services-page FAQ answer with Piper, an open-source neural voice that runs
// offline (no account or key). Output: public/audio/faq/faq-<hash>.m4a, replacing any earlier
// local recording. ElevenLabs .mp3 recordings (npm run faq:audio) still take priority.
//
// One-time setup (already done on this machine; kept in .tools/, which is git-ignored):
//   python3 -m venv .tools/piper/venv && .tools/piper/venv/bin/pip install piper-tts
//   download en_GB-jenny_dioco-medium.onnx and .onnx.json from
//   https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/jenny_dioco/medium  into .tools/piper/
//
//   npm run faq:audio:piper

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { root, OUT_DIR, faqHash, toSpeech, loadFaqs } from './faq-shared.mjs';

const PIPER = path.join(root, '.tools/piper');
const PY = path.join(PIPER, 'venv/bin/python');
const MODEL = path.join(PIPER, 'en_GB-jenny_dioco-medium.onnx');
const CONFIG = `${MODEL}.json`;

for (const f of [PY, MODEL, CONFIG]) {
  if (!existsSync(f)) {
    console.error(`Missing ${path.relative(root, f)}. See the setup notes at the top of this script.`);
    process.exit(1);
  }
}

mkdirSync(OUT_DIR, { recursive: true });
let made = 0;
for (const f of loadFaqs()) {
  const file = path.join(OUT_DIR, `faq-${faqHash(f.question, f.answer)}.m4a`);
  const stamp = `${Date.now()}-${made}`;
  const txt = path.join(tmpdir(), `piper-${stamp}.txt`);
  const wav = path.join(tmpdir(), `piper-${stamp}.wav`);
  // One line per utterance: the question, then the answer. A soft pause follows each sentence.
  writeFileSync(txt, `${f.question.replace(/\?*$/, '?')}\n${toSpeech(f.answer)}\n`);
  try {
    execFileSync(
      PY,
      [
        '-m', 'piper', '-m', MODEL, '-c', CONFIG, '-i', txt, '-f', wav,
        '--length-scale', '1.32',   // higher = slower. 1.0 is the voice's normal pace
        '--noise-scale', '0.5',     // steadier, less variation
        '--noise-w-scale', '0.6',
        '--sentence-silence', '0.6',
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] }
    );
    execFileSync('afconvert', [wav, file, '-f', 'm4af', '-d', 'aac', '-b', '64000', '-c', '1']);
  } finally {
    rmSync(txt, { force: true });
    rmSync(wav, { force: true });
  }
  console.log(`made  ${path.basename(file)}  (${Math.round(statSync(file).size / 1024)} KB)  ${f.question}`);
  made++;
}
console.log(`\nDone: ${made} answers recorded with the Piper "jenny_dioco" voice. Reload the services page and press Listen.`);
