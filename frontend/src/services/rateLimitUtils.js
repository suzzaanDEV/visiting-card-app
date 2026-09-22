// Format a wait time in seconds into a human-friendly string, e.g.
// "12 minutes and 30 seconds" or "45 seconds".
export const formatRateLimitWait = (seconds) => {
  const secs = Math.max(1, Math.round(Number(seconds) || 0));
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  if (mins === 0) return `${secs} second${secs === 1 ? '' : 's'}`;
  const parts = [`${mins} minute${mins === 1 ? '' : 's'}`];
  if (rem > 0) parts.push(`${rem} second${rem === 1 ? '' : 's'}`);
  return parts.join(' and ');
};

const parseRetryAfter = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

// Build the friendly rate-limit message, preferring the real remaining time from
// the 429 response body (`retryAfter` seconds) and falling back to the header.
export const getRateLimitMessage = async (response, fallbackSeconds = 900) => {
  let seconds = null;

  const body = await response.clone().json().catch(() => null);
  if (body && typeof body.retryAfter === 'number') {
    seconds = body.retryAfter;
  } else {
    seconds = parseRetryAfter(response.headers.get('retry-after'));
  }

  const wait = formatRateLimitWait(seconds ?? fallbackSeconds);
  return `Rate limit exceeded. Please wait ${wait} before trying again.`;
};