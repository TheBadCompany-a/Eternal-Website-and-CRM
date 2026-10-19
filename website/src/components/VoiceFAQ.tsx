import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Pause, Play, RotateCcw, Volume2 } from 'lucide-react';
import { faqAudioSources, toSpeech, pickFemaleVoice, SOFT_VOICE } from '../utils/faqAudio';

export interface VoiceFAQItem {
  question: string;
  answer: string;
}

type PlayState = 'idle' | 'playing' | 'paused';

// Speak in sentence-sized pieces: keeps long answers from being cut off by some browsers
// and lets pause / resume behave predictably.
const toChunks = (text: string): string[] =>
  (toSpeech(text).match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [text]).map((s) => s.trim()).filter(Boolean);

const ttsSupported = () =>
  typeof window !== 'undefined' && !!window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function';
const audioSupported = () => typeof window !== 'undefined' && typeof Audio !== 'undefined';

const ctrlBtn =
  'inline-flex items-center justify-center gap-2 min-w-11 h-11 px-3 rounded-full border text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

export const VoiceFAQ: React.FC<{ faqs: VoiceFAQItem[] }> = ({ faqs }) => {
  const { t } = useTranslation('faq');
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [state, setState] = useState<PlayState>('idle');
  const [announce, setAnnounce] = useState('');
  const [canSpeak, setCanSpeak] = useState(false);
  const [failed, setFailed] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // recorded voice, when a recording exists
  const modeRef = useRef<'audio' | 'tts' | null>(null);
  const runRef = useRef(0); // ignore callbacks from playback that has been cancelled

  // Recorded audio works everywhere; the browser voice is only the fallback.
  useEffect(() => {
    setCanSpeak(audioSupported() || ttsSupported());
    if (!ttsSupported()) return;
    const synth = window.speechSynthesis;
    const pick = () => {
      voiceRef.current = pickFemaleVoice(synth.getVoices());
    };
    pick();
    synth.addEventListener?.('voiceschanged', pick);
    return () => {
      synth.removeEventListener?.('voiceschanged', pick);
      synth.cancel();
    };
  }, []);

  // Stop any recorded audio when the visitor leaves the page.
  useEffect(() => () => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, []);

  const stop = useCallback(() => {
    runRef.current += 1;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
    modeRef.current = null;
    if (ttsSupported()) window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback(
    (idx: number) => {
      stop();
      const run = runRef.current;
      const faq = faqs[idx];
      setActiveIdx(idx);
      setOpenIdx(idx); // show the text that is being read
      setState('playing');
      setFailed(false);
      setAnnounce(t('voiceFaqUi.announce.playing', { question: faq.question }));

      const finish = () => {
        if (run !== runRef.current) return;
        setState('idle');
        setAnnounce(t('voiceFaqUi.announce.finished'));
      };
      const fail = () => {
        if (run !== runRef.current) return;
        setState('idle');
        setFailed(true);
        setAnnounce(t('voiceFaqUi.announce.failed'));
      };

      // Fallback: the browser's own voice, in sentence-sized pieces.
      const speakWithBrowserVoice = () => {
        if (run !== runRef.current) return;
        if (!ttsSupported()) return fail();
        modeRef.current = 'tts';
        const chunks = [faq.question.replace(/\?*$/, '?'), ...toChunks(faq.answer)];
        chunks.forEach((c, i) => {
          const u = new SpeechSynthesisUtterance(c);
          u.lang = voiceRef.current?.lang || 'en-IN';
          if (voiceRef.current) u.voice = voiceRef.current;
          u.rate = SOFT_VOICE.rate;
          u.pitch = SOFT_VOICE.pitch;
          u.volume = SOFT_VOICE.volume;
          if (i === chunks.length - 1) u.onend = finish;
          u.onerror = (e) => {
            if (e.error === 'canceled' || e.error === 'interrupted') return;
            fail();
          };
          window.speechSynthesis.speak(u);
        });
      };

      // Preferred: a recorded voice. Try each recording in turn; if none exists (or none
      // decodes), drop through to the browser voice.
      if (!audioSupported()) return speakWithBrowserVoice();
      const sources = faqAudioSources(faq.question, faq.answer);
      const tryRecording = (n: number) => {
        if (run !== runRef.current) return;
        if (n >= sources.length) {
          audioRef.current = null;
          return speakWithBrowserVoice();
        }
        const audio = new Audio(sources[n]);
        audioRef.current = audio;
        modeRef.current = 'audio';
        let moved = false;
        const next = () => {
          if (moved || run !== runRef.current) return;
          moved = true;
          audio.onended = null;
          audio.onerror = null;
          tryRecording(n + 1);
        };
        audio.onended = finish;
        audio.onerror = next;
        audio.play().catch((err: unknown) => {
          if ((err as { name?: string })?.name === 'AbortError') return; // interrupted by pause/stop
          next();
        });
      };
      tryRecording(0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [faqs, stop]
  );

  const toggle = (idx: number) => {
    if (activeIdx === idx && state === 'playing') {
      if (modeRef.current === 'audio') audioRef.current?.pause();
      else window.speechSynthesis.pause();
      setState('paused');
      setAnnounce(t('voiceFaqUi.announce.paused'));
    } else if (activeIdx === idx && state === 'paused') {
      if (modeRef.current === 'audio') void audioRef.current?.play();
      else window.speechSynthesis.resume();
      setState('playing');
      setAnnounce(t('voiceFaqUi.announce.resumed'));
    } else {
      speak(idx);
    }
  };

  const stopAll = () => {
    stop();
    setState('idle');
    setActiveIdx(null);
    setAnnounce(t('voiceFaqUi.announce.stopped'));
  };

  return (
    <section id="faqs" className="py-20 md:py-28 px-6 md:px-12 bg-ivory border-t border-gold/15 scroll-mt-24">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-[0.28em] text-gold font-bold block mb-3">{t('voiceFaqUi.kicker')}</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-deep-brown leading-tight mb-4">
            {t('voiceFaqUi.heading')}
          </h2>
          <p className="text-sm md:text-base text-charcoal/70 font-light leading-relaxed">
            {t('voiceFaqUi.subheading')}
          </p>
        </div>

        {/* Voice intro + global stop */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-blush/50 border border-gold/25 rounded-xs">
          <p className="flex items-center gap-3 text-sm text-deep-brown">
            <Volume2 className="w-5 h-5 text-gold shrink-0" aria-hidden="true" />
            {canSpeak
              ? t('voiceFaqUi.listenIntro')
              : t('voiceFaqUi.listenUnavailable')}
          </p>
          {canSpeak && state !== 'idle' && (
            <button type="button" onClick={stopAll} className={`${ctrlBtn} border-deep-brown/40 text-deep-brown hover:bg-deep-brown hover:text-ivory`}>
              {t('voiceFaqUi.stopAudio')}
            </button>
          )}
        </div>

        {failed && (
          <p role="alert" className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xs px-4 py-3">
            {t('voiceFaqUi.playbackFailed')}
          </p>
        )}

        {/* Screen-reader status updates */}
        <div className="sr-only" role="status" aria-live="polite">{announce}</div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            const isActive = activeIdx === idx;
            const playing = isActive && state === 'playing';
            const paused = isActive && state === 'paused';
            return (
              <div
                key={faq.question}
                className={`bg-white border rounded-xs overflow-hidden transition-colors duration-300 shadow-xs ${playing || paused ? 'border-gold' : 'border-gold/25'}`}
              >
                <div className="flex items-stretch">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${idx}`}
                    className="flex-1 min-w-0 px-5 md:px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-blush/30 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gold"
                  >
                    <span className="font-serif text-lg md:text-xl font-bold text-deep-brown">{faq.question}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`w-4 h-4 text-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-deep-brown' : ''}`}
                    />
                  </button>

                  {canSpeak && (
                    <div className="flex items-center gap-2 pr-4 pl-1 md:pr-5" role="group" aria-label={t('voiceFaqUi.audioControlsFor', { question: faq.question })}>
                      {isActive && (
                        <button
                          type="button"
                          onClick={() => speak(idx)}
                          aria-label={t('voiceFaqUi.replayAnswer', { question: faq.question })}
                          title={t('voiceFaqUi.replay')}
                          className={`${ctrlBtn} border-gold/40 text-deep-brown hover:bg-blush`}
                        >
                          <RotateCcw className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => toggle(idx)}
                        aria-label={
                          playing
                            ? t('voiceFaqUi.pauseAnswer', { question: faq.question })
                            : paused
                            ? t('voiceFaqUi.resumeAnswer', { question: faq.question })
                            : t('voiceFaqUi.listenToAnswer', { question: faq.question })
                        }
                        title={playing ? t('voiceFaqUi.pause') : paused ? t('voiceFaqUi.resume') : t('voiceFaqUi.listen')}
                        className={`${ctrlBtn} ${playing || paused ? 'bg-deep-brown border-deep-brown text-ivory hover:bg-gold hover:border-gold' : 'border-gold/50 text-gold hover:bg-gold hover:text-ivory'}`}
                      >
                        {playing ? <Pause className="w-4 h-4" aria-hidden="true" /> : <Play className="w-4 h-4" aria-hidden="true" />}
                        <span className="hidden sm:inline">{playing ? t('voiceFaqUi.pause') : paused ? t('voiceFaqUi.resume') : t('voiceFaqUi.listen')}</span>
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-6 pt-3 text-sm md:text-[15px] text-charcoal/80 font-light leading-relaxed border-t border-gold/10">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VoiceFAQ;
