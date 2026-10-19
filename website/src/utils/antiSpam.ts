import React, { useRef, useState } from 'react';

/**
 * Lightweight, dependency-free bot mitigation for public forms: a hidden
 * field real visitors never see or fill, plus a minimum-fill-time check
 * (most scripted submissions fire in well under a second). Either signal
 * alone can false-positive on a fast human or a thorough bot, so a
 * submission is only treated as spam when both line up... in practice
 * checking `isBot()` (honeypot filled OR too fast) is enough to stop the
 * unsophisticated bots that make up the bulk of form spam, without ever
 * showing visitors a CAPTCHA.
 */
export function useHoneypot() {
  const [value, setValue] = useState('');
  const mountedAt = useRef(Date.now());

  const isBot = () => value.trim().length > 0 || Date.now() - mountedAt.current < 1200;
  const reset = () => { mountedAt.current = Date.now(); setValue(''); };

  const field = React.createElement('input', {
    type: 'text',
    name: 'company_website',
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
    tabIndex: -1,
    autoComplete: 'off',
    'aria-hidden': 'true',
    style: { position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' },
  });

  return { field, isBot, reset };
}
