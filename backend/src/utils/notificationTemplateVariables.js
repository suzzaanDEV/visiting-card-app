const Settings = require('../models/settingsModel');

// Registry of every variable a NotificationTemplate author can use inside
// {{double_curly}} placeholders. This is the single source of truth surfaced to
// the admin editor so template creators know exactly what will render.
//
// `runtime: true` variables are resolved by the renderer itself (renderTemplate),
// even when the caller passes an empty variables object.
const availableVariables = [
  // ── Runtime built-ins (always available, resolved by the renderer) ──────────
  {
    key: 'currentTimestamp',
    label: 'Current Timestamp',
    category: 'Runtime',
    runtime: true,
    description: 'The exact date & time the notification is generated, e.g. Sep 23, 2026, 3:04 PM.',
    example: 'Sep 23, 2026, 3:04 PM'
  },
  {
    key: 'currentDate',
    label: 'Current Date',
    category: 'Runtime',
    runtime: true,
    description: 'The date the notification is generated, in YYYY-MM-DD format.',
    example: '2026-09-23'
  },
  {
    key: 'appName',
    label: 'App / Site Name',
    category: 'Runtime',
    runtime: true,
    description: 'The branded site name configured in Admin → Settings (defaults to "Cardly").',
    example: 'Cardly'
  },

  // ── Recipient context ────────────────────────────────────────────────────────
  {
    key: 'recipientName',
    label: 'Recipient Name',
    category: 'Recipient',
    description: 'The name of the person receiving the notification.',
    example: 'Suzan Ghimire'
  },
  {
    key: 'recipientUsername',
    label: 'Recipient Username',
    category: 'Recipient',
    description: 'The username of the person receiving the notification.',
    example: 'suzanghimire'
  },
  {
    key: 'recipientEmail',
    label: 'Recipient Email',
    category: 'Recipient',
    description: 'The email address of the person receiving the notification.',
    example: 'person@example.com'
  },

  // ── Actor / requester context ────────────────────────────────────────────────
  {
    key: 'senderName',
    label: 'Actor Name',
    category: 'Actor',
    description: 'The name of the person who triggered the event (e.g. who loved/sent the card).',
    example: 'Ramesh Sharma'
  },
  {
    key: 'senderUsername',
    label: 'Actor Username',
    category: 'Actor',
    description: 'The username of the person who triggered the event.',
    example: 'ramesh'
  },

  // ── Card context ─────────────────────────────────────────────────────────────
  {
    key: 'cardTitle',
    label: 'Card Title',
    category: 'Card',
    description: 'The title of the card involved in the event.',
    example: 'Marketing Manager — Acme Inc.'
  },
  {
    key: 'shortLink',
    label: 'Card Short Link',
    category: 'Card',
    description: 'The card short-link slug (e.g. visit cardly.app/c/abc123).',
    example: 'abc123'
  },
  {
    key: 'cardUrl',
    label: 'Card URL',
    category: 'Card',
    description: 'Full public URL to the card.',
    example: 'https://cardly.app/c/abc123'
  },

  // ── Event context ────────────────────────────────────────────────────────────
  {
    key: 'reason',
    label: 'Event Reason',
    category: 'Event',
    description: 'The reason attached to an event (e.g. why an access request was rejected).',
    example: 'Contact info is shared with approved members only.'
  },
  {
    key: 'requestId',
    label: 'Request Reference',
    category: 'Event',
    description: 'The reference id of the underlying event (e.g. a card access request).',
    example: '66e1a2b3c4d5e6f7a8b9c0d1'
  }
];

// Runtime values the renderer injects automatically. Async because the site
// name is stored in the Settings collection.
async function getRuntimeDefaults() {
  let appName = 'Cardly';
  try {
    const settings = await Settings.findOne().lean();
    appName = settings?.system?.siteName || 'Cardly';
  } catch {
    // fall back to the hardcoded brand
  }

  const now = new Date();
  return {
    currentTimestamp: formatTimestamp(now),
    currentDate: now.toISOString().slice(0, 10),
    appName
  };
}

function formatTimestamp(date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

module.exports = { availableVariables, getRuntimeDefaults, formatTimestamp };