import React, { useEffect, useRef } from 'react';

const DEFAULT_LENGTH = 6;

const OtpInput = ({
  value = '',
  length = DEFAULT_LENGTH,
  onChange,
  onComplete,
  autoFocus = false,
  disabled = false,
  label = '6-Digit Verification Code',
  className = '',
  ...props
}) => {
  const refs = useRef([]);
  const normalized = typeof value === 'string' ? value.replace(/\D/g, '').slice(0, length) : '';

  const focusIndex = (index) => {
    const el = refs.current[index];
    if (el) el.focus();
  };

  useEffect(() => {
    if (autoFocus) focusIndex(0);
  }, [autoFocus]);

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = normalized.split('');
    next[index] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (digit && index < length - 1) focusIndex(index + 1);
    if (joined.length === length && onComplete) onComplete(joined);
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = normalized.split('');
      if (next[index]) {
        next[index] = '';
        onChange(next.join(''));
        focusIndex(index);
      } else if (index > 0) {
        next[index - 1] = '';
        onChange(next.join(''));
        focusIndex(index - 1);
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); focusIndex(index - 1); return; }
    if (e.key === 'ArrowRight' && index < length - 1) { e.preventDefault(); focusIndex(index + 1); return; }
    if (e.key === 'Home') { e.preventDefault(); focusIndex(0); return; }
    if (e.key === 'End') { e.preventDefault(); focusIndex(length - 1); }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    if (pasted.length === length && onComplete) onComplete(pasted);
    focusIndex(Math.min(pasted.length, length - 1));
  };

  return (
    <div className={className} {...props}>
      <span id="otp-label" className="sr-only">{label}</span>
      <div
        role="group"
        aria-labelledby="otp-label"
        className="flex justify-center gap-2"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = normalized[index] || '';
          return (
            <input
              key={index}
              ref={(el) => { refs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              pattern="\d*"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              disabled={disabled}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              aria-label={`Digit ${index + 1} of ${length}`}
              className="w-11 sm:w-12 h-14 text-center text-xl font-bold bg-brand-surface dark:bg-slate-800 text-brand-text border border-brand-border dark:border-slate-700 rounded-xl outline-none transition-all duration-150 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
          );
        })}
      </div>
    </div>
  );
};

export default OtpInput;
export { OtpInput };