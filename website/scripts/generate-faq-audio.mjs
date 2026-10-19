#!/usr/bin/env node
// Generates a spoken MP3 for every services-page FAQ using ElevenLabs text-to-speech.
// Files are written to public/audio/faq/ and picked up automatically by the Voice FAQ.
//
//   ELEVENLABS_API_KEY=...  npm run faq:audio -- --dry-run     # list what would be made (no key needed)
//   ELEVENLABS_API_KEY=...  npm run faq:audio -- --yes         # generate the missing recordings
//
// Environment (never commit these; .env* files are already git-ignored):
//   ELEVENLABS_API_KEY     required to generate
//   ELEVENLABS_VOICE_ID    optional. If not set, the voice is looked up by name in your ElevenLabs library
//   ELEVENLABS_VOICE_NAME  optional. Default: the first of Sarah, Rachel, Matilda, Alice found in your library
//                          (soft, calm female voices that ship with ElevenLabs)
//   ELEVENLABS_MODEL       optional, default "eleven_multilingual_v2"
//
// Flags:  --dry-run  show the plan only   --yes  confirm you accept the credit usage   --force  regenerate existing files
//         --list-voices  show the female voices in your ElevenLabs library, with a preview link for each (no credits used)
//
// ElevenLabs charges credits per character, so the script prints the total first and needs --yes to continue.

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { OUT_DIR, faqHash, toSpeech, loadFaqs, loadEnvLocal } from './faq-shared.mjs';

loadEnvLocal(); // lets ELEVENLABS_API_KEY live in .env.local instead of the command line

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const YES = args.has('--yes');
const FORCE = args.has('--force');
const LIST = args.has('--list-voices');

const API = 'https://api.elevenlabs.io/v1';
const KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_NAMES = process.env.ELEVENLABS_VOICE_NAME
  ? [process.env.ELEVENLABS_VOICE_NAME]
  : ['Sarah', 'Rachel', 'Matilda', 'Alice'];
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

async function resolveVoiceId() {
  if (process.env.ELEVENLABS_VOICE_ID) return process.env.ELEVENLABS_VOICE_ID;
  const res = await fetch(`${API}/voices`, { headers: { 'xi-api-key': KEY } });
  if (!res.ok) throw new Error(`Could not list voices (HTTP ${res.status}). Check ELEVENLABS_API_KEY.`);
  const { voices = [] } = await res.json();
  let hit;
  for (const name of VOICE_NAMES) {
    hit = voices.find((v) => v.name?.toLowerCase().includes(name.toLowerCase()));
    if (hit) break;
  }
  if (!hit) {
    const names = voices.map((v) => v.name).join(', ') || '(none)';
    throw new Error(
      `None of these voices were found in your ElevenLabs library: ${VOICE_NAMES.join(', ')}.\n` +
        `Add one to "My Voices" in ElevenLabs, or set ELEVENLABS_VOICE_NAME / ELEVENLABS_VOICE_ID.\nVoices found: ${names}`
    );
  }
  console.log(`Using voice: ${hit.name} (${hit.voice_id})`);
  return hit.voice_id;
}

async function listVoices() {
  if (!KEY) throw new Error('ELEVENLABS_API_KEY is not set.');
  const res = await fetch(`${API}/voices`, { headers: { 'xi-api-key': KEY } });
  if (!res.ok) throw new Error(`Could not list voices (HTTP ${res.status}). Check ELEVENLABS_API_KEY.`);
  const { voices = [] } = await res.json();
  const gender = (v) => (v.labels?.gender || '').toLowerCase();
  const female = voices.filter((v) => gender(v) === 'female');
  const rest = voices.filter((v) => gender(v) !== 'female');
  const show = (v) => {
    const l = v.labels || {};
    const tags = [l.gender, l.accent, l.age, l.descriptive || l.description, l.use_case].filter(Boolean).join(', ');
    console.log(`- ${v.name}${tags ? `  [${tags}]` : ''}`);
    if (v.preview_url) console.log(`    listen: ${v.preview_url}`);
  };
  console.log(`Female voices in your library (${female.length}). Look for ones described as calm, soft or warm:\n`);
  female.forEach(show);
  if (rest.length) console.log(`\nOther voices: ${rest.map((v) => v.name).join(', ')}`);
  console.log('\nTo use one:  ELEVENLABS_VOICE_NAME="<name>" ELEVENLABS_API_KEY=... npm run faq:audio -- --yes --force');
}

async function main() {
  if (LIST) return listVoices();
  const faqs = loadFaqs();
  const plan = faqs.map((f) => {
    const file = `faq-${faqHash(f.question, f.answer)}.mp3`;
    const text = toSpeech(`${f.question.replace(/\?*$/, '?')} ${f.answer}`);
    return { file, text, exists: existsSync(path.join(OUT_DIR, file)), question: f.question };
  });
  const todo = plan.filter((p) => FORCE || !p.exists);
  const chars = todo.reduce((n, p) => n + p.text.length, 0);

  console.log(`${plan.length} FAQs, ${todo.length} to generate, ~${chars} characters of ElevenLabs credit.\n`);
  for (const p of plan) console.log(`${p.exists && !FORCE ? 'have ' : 'make '} ${p.file}  ${p.question}`);

  if (DRY) return console.log('\nDry run: nothing generated.');
  if (!todo.length) return console.log('\nNothing to do. All FAQ audio is up to date.');
  if (!KEY) throw new Error('ELEVENLABS_API_KEY is not set.');
  if (!YES) {
    console.log('\nThis will use ElevenLabs credits. Re-run with --yes to continue.');
    process.exitCode = 1;
    return;
  }

  const voiceId = await resolveVoiceId();
  mkdirSync(OUT_DIR, { recursive: true });
  for (const p of todo) {
    process.stdout.write(`Generating ${p.file} ... `);
    const res = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text: p.text,
        model_id: MODEL,
        // Higher stability = an even, calm delivery. Slightly slower speech reads as soft.
        voice_settings: { stability: 0.7, similarity_boost: 0.75, style: 0, speed: 0.85 },
      }),
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 300);
      throw new Error(`ElevenLabs returned HTTP ${res.status}: ${body}`);
    }
    writeFileSync(path.join(OUT_DIR, p.file), Buffer.from(await res.arrayBuffer()));
    console.log('done');
  }
  console.log('\nAll done. Reload the services page and press Listen on any FAQ.');
}

main().catch((e) => {
  console.error('\n' + e.message);
  process.exit(1);
});
