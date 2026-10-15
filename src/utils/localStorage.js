/**
 * Tiny wrapper around localStorage.
 *
 * Why bother wrapping it?
 *  - localStorage only stores strings, so we always need JSON.parse / stringify.
 *  - It throws in private-browsing mode, so we guard with try/catch.
 *
 * These helpers are used by the auth and registrations slices so that the
 * login state and the user's registrations survive a page refresh.
 */

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked — the app still works, just without persistence.
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

// The keys we use, kept in one place to avoid typos.
export const STORAGE_KEYS = {
  users: 'ems_users',
  currentUser: 'ems_current_user',
  registrations: 'ems_registrations',
}
