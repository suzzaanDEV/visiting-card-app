// Per-browser anonymous visitor identifier used to deduplicate analytics/view
// events. Stored in localStorage so refreshes by the same visitor don't inflate
// counters; sent as the `x-visitor-id` header on public card requests.
const STORAGE_KEY = 'cardly-visitor-id';

export function getVisitorId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : generateUuid();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function generateUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}