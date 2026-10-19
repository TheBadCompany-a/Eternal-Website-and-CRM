// Recorded FAQ audio. Each FAQ answer has an MP3 in public/audio/faq/, named from a hash of
// its text. If the wording changes the hash changes, so a stale recording is never played:
// the FAQ falls back to the browser voice until the audio is regenerated.
//
// Generate the recordings with:  npm run faq:audio   (see scripts/generate-faq-audio.mjs)
// KEEP `faqHash` AND `toSpeech` IN SYNC WITH scripts/generate-faq-audio.mjs.

export const faqHash = (question: string, answer: string): string => {
  const s = `${question}\n${answer}`;
  let h = 5381;
  for (const ch of s) h = ((h << 5) + h + (ch.codePointAt(0) as number)) >>> 0;
  return h.toString(36);
};

export const faqAudioSrc = (question: string, answer: string): string =>
  `/audio/faq/faq-${faqHash(question, answer)}.mp3`;

// Recordings to try, best first: ElevenLabs (.mp3), then the locally recorded voice (.m4a).
export const faqAudioSources = (question: string, answer: string): string[] => {
  const base = `/audio/faq/faq-${faqHash(question, answer)}`;
  return [`${base}.mp3`, `${base}.m4a`];
};

// Make numbers, phone numbers and abbreviations read naturally.
export const toSpeech = (text: string): string =>
  text
    .replace(/\+91[\s-]*84486[\s-]*61338/g, 'plus nine one, eight four four eight six, six one three three eight')
    .replace(/24\s*[×x]\s*7/gi, 'twenty-four by seven')
    .replace(/\bNOC\b/g, 'N O C')
    .replace(/\s+/g, ' ')
    .trim();

// ---- Browser-voice fallback: prefer a soft, calm female voice ----------------------------
// Voices differ by device, so rank whatever is installed instead of naming one voice.
const FEMALE_HINTS =
  /female|woman|zira|heera|neerja|veena|samantha|karen|moira|tessa|fiona|victoria|susan|hazel|libby|sonia|aria|jenny|natasha|catherine|allison|ava|serena|kate|joanna|salli|kendra|kimberly|ivy|amy|emma|nicole|lekha/i;
const MALE_HINTS = /\bmale\b|rishi|ravi|david|mark|george|daniel|alex|fred|tom|james|guy|ryan|hemant|prabhat|thomas|oliver|arthur|brian|matthew|joey|justin/i;

// macOS ships joke / effect voices; never use those to answer a family's question.
const NOVELTY = /bad news|good news|bahh|bells|boing|bubbles|cellos|deranged|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|albert|junior|kathy|ralph|princess|fred/i;

const voiceScore = (v: { name: string; lang: string }): number => {
  const lang = v.lang.replace('_', '-').toLowerCase();
  if (!lang.startsWith('en') || NOVELTY.test(v.name)) return -1000;
  let score = 0;
  if (lang === 'en-in') score += 40; // Indian English first
  else if (lang === 'en-gb' || lang === 'en-au') score += 12;
  else if (lang === 'en-us') score += 8;
  else score += 4;
  if (/natural|neural|online|premium|enhanced/i.test(v.name)) score += 30; // far more human-sounding
  if (FEMALE_HINTS.test(v.name)) score += 25;
  if (MALE_HINTS.test(v.name)) score -= 60;
  return score;
};

export const pickFemaleVoice = <T extends { name: string; lang: string }>(voices: T[]): T | null => {
  let best: T | null = null;
  let bestScore = -Infinity;
  for (const v of voices) {
    const sc = voiceScore(v);
    if (sc > bestScore) {
      best = v;
      bestScore = sc;
    }
  }
  return best && bestScore > -1000 ? best : null;
};

// Slow and even reads as calm.
export const SOFT_VOICE = { rate: 0.88, pitch: 1.0, volume: 0.95 } as const;
