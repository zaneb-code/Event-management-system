/**
 * Small formatting + validation helpers shared across the app.
 */

/** "2026-11-04" -> "Wed, 4 Nov 2026" */
export function formatDate(dateString) {
  if (!dateString) return 'Date to be announced'

  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString

  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** "19:30:00" -> "7:30 PM" */
export function formatTime(timeString) {
  if (!timeString) return null

  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes))

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Joins the city / state / country parts that actually exist. */
export function formatLocation(event) {
  const parts = [event.city, event.state, event.country].filter(Boolean)
  return parts.length ? parts.join(', ') : 'Location to be announced'
}

/** "$45.00 – $120.00" or null when the API gives us no price. */
export function formatPriceRange(event) {
  if (event.priceMin == null && event.priceMax == null) return null

  const currency = event.currency || 'USD'
  const money = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)

  if (event.priceMin != null && event.priceMax != null && event.priceMin !== event.priceMax) {
    return `${money(event.priceMin)} – ${money(event.priceMax)}`
  }
  return money(event.priceMin ?? event.priceMax)
}

/**
 * Is the event date in the past?
 * Used by My Events to split "Upcoming" from "Completed".
 */
export function isPastEvent(dateString) {
  if (!dateString) return false

  const eventDate = new Date(`${dateString}T23:59:59`)
  return eventDate.getTime() < Date.now()
}

/** Today as "2026-10-13T00:00:00Z" — the format Ticketmaster wants. */
export function todayAsApiDate() {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T00:00:00Z`
}

/* ------------------------------------------------------------------
 *  Form validation
 * ------------------------------------------------------------------ */

export function isValidEmail(email) {
  // Good enough for a frontend check: something@something.something
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
}

/**
 * Validates the Register form and returns an object of error messages.
 * An empty object means "no errors".
 */
export function validateRegisterForm({ name, email, password, confirmPassword }) {
  const errors = {}

  if (!name.trim()) {
    errors.name = 'Please enter your name.'
  } else if (name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters.'
  }

  if (!email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!isValidEmail(email)) {
    errors.email = 'That does not look like a valid email address.'
  }

  if (!password) {
    errors.password = 'Please choose a password.'
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

export function validateLoginForm({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!isValidEmail(email)) {
    errors.email = 'That does not look like a valid email address.'
  }

  if (!password) errors.password = 'Please enter your password.'

  return errors
}

/** First letter of each word, max 2 — used for the avatar circle. */
export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}
