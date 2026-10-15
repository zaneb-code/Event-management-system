/**
 * ============================================================
 *  Ticketmaster Discovery API helper
 * ============================================================
 *
 * All network calls to Ticketmaster live in this one file.
 * Keeping them separate from the Redux slices means:
 *   - the slices stay easy to read,
 *   - if the API ever changes, we only edit this file.
 *
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2'

// Vite exposes variables from .env that start with VITE_
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY

/** Simple check so we can show a friendly message instead of a confusing 401. */
export const hasApiKey = Boolean(API_KEY && API_KEY !== 'your_consumer_key_here')

/**
 * Builds a full URL with the api key + any query params.
 * Empty / undefined params are skipped so the URL stays clean.
 */
function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`)
  url.searchParams.set('apikey', API_KEY ?? '')

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

/**
 * One shared fetch wrapper that turns HTTP errors into real JS errors
 * so that `createAsyncThunk` can put them in `state.error` for us.
 */
async function request(path, params) {
  if (!hasApiKey) {
    throw new Error(
      'No Ticketmaster API key found. Copy .env.example to .env and add your key, then restart the dev server.'
    )
  }

  const response = await fetch(buildUrl(path, params))

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API key (401). Double-check VITE_TICKETMASTER_API_KEY in your .env file.')
    }
    if (response.status === 429) {
      throw new Error('Rate limit reached (429). Ticketmaster allows 2 requests per second — please wait a moment.')
    }
    throw new Error(`Ticketmaster request failed with status ${response.status}.`)
  }

  return response.json()
}

/* ------------------------------------------------------------------
 *  Normalising helpers
 *
 *  The raw API response is deeply nested, e.g.
 *    event._embedded.venues[0].city.name
 *  Rather than writing that everywhere in our components, we flatten
 *  each event into a simple, predictable object once, right here.
 * ------------------------------------------------------------------ */

/** Picks the widest 16:9 image, which looks best in our cards. */
function pickImage(images = []) {
  if (!images.length) return null

  const wide = images
    .filter((img) => img.ratio === '16_9' && img.width >= 640)
    .sort((a, b) => b.width - a.width)

  return (wide[0] || images[0]).url
}

export function normaliseEvent(event) {
  const venue = event._embedded?.venues?.[0]
  const classification = event.classifications?.[0]
  const price = event.priceRanges?.[0]

  return {
    id: event.id,
    name: event.name,
    url: event.url ?? null,
    image: pickImage(event.images),

    // Dates
    date: event.dates?.start?.localDate ?? null,
    time: event.dates?.start?.localTime ?? null,
    dateTime: event.dates?.start?.dateTime ?? null,
    timezone: event.dates?.timezone ?? null,
    status: event.dates?.status?.code ?? 'onsale', // onsale | offsale | cancelled | postponed
    onSaleFrom: event.sales?.public?.startDateTime ?? null,

    // Venue + location
    venue: venue?.name ?? 'Venue to be announced',
    address: venue?.address?.line1 ?? null,
    city: venue?.city?.name ?? null,
    state: venue?.state?.name ?? venue?.state?.stateCode ?? null,
    country: venue?.country?.name ?? null,
    postalCode: venue?.postalCode ?? null,

    // Category / type
    segment: classification?.segment?.name ?? 'Other',
    genre: classification?.genre?.name ?? null,
    subGenre: classification?.subGenre?.name ?? null,

    // Extra useful info from the API
    info: event.info ?? null,
    pleaseNote: event.pleaseNote ?? null,
    priceMin: price?.min ?? null,
    priceMax: price?.max ?? null,
    currency: price?.currency ?? null,
    ticketLimit: event.ticketLimit?.info ?? null,
    seatmap: event.seatmap?.staticUrl ?? null,
    promoter: event.promoter?.name ?? null,
    attractions:
      event._embedded?.attractions?.map((a) => ({
        id: a.id,
        name: a.name,
        image: pickImage(a.images),
        url: a.url ?? null,
      })) ?? [],
  }
}

/* ------------------------------------------------------------------
 *  Public API functions used by our Redux thunks
 * ------------------------------------------------------------------ */

/**
 * Search / list events.
 *
 * @param {object} options
 * @param {string} options.keyword        free-text search
 * @param {string} options.city           city name
 * @param {string} options.countryCode    two-letter code, e.g. "US"
 * @param {string} options.classificationName  category, e.g. "Music"
 * @param {string} options.startDateTime  ISO date, e.g. "2026-01-01T00:00:00Z"
 * @param {string} options.sort           e.g. "date,asc" or "relevance,desc"
 * @param {number} options.page           zero-based page number
 * @param {number} options.size           results per page (max 200)
 */
export async function fetchEvents({
  keyword = '',
  city = '',
  countryCode = '',
  classificationName = '',
  startDateTime = '',
  endDateTime = '',
  sort = 'date,asc',
  page = 0,
  size = 12,
} = {}) {
  const data = await request('/events.json', {
    keyword,
    city,
    countryCode,
    classificationName,
    startDateTime,
    endDateTime,
    sort,
    page,
    size,
  })

  return {
    events: (data._embedded?.events ?? []).map(normaliseEvent),
    page: {
      number: data.page?.number ?? 0,
      size: data.page?.size ?? size,
      totalPages: data.page?.totalPages ?? 0,
      totalElements: data.page?.totalElements ?? 0,
    },
  }
}

/** Fetch one event by its Ticketmaster id, for the details page. */
export async function fetchEventById(eventId) {
  const data = await request(`/events/${eventId}.json`)
  return normaliseEvent(data)
}

/**
 * Fetch the list of categories (Ticketmaster calls these "segments"),
 * e.g. Music, Sports, Arts & Theatre, Film.
 */
export async function fetchCategories() {
  const data = await request('/classifications.json', { size: 20 })

  const segments = (data._embedded?.classifications ?? [])
    .map((c) => c.segment)
    .filter(Boolean)
    .filter((segment) => segment.name !== 'Undefined')

  // Remove duplicates by id
  const unique = []
  segments.forEach((segment) => {
    if (!unique.some((s) => s.id === segment.id)) {
      // Genres arrive under _embedded.genres on the classifications
      // endpoint but as a plain `genres` array inside an event's
      // classifications, so accept either shape.
      const genres = segment._embedded?.genres ?? segment.genres ?? []

      unique.push({
        id: segment.id,
        name: segment.name,
        genres: genres.map((g) => g.name).filter(Boolean).slice(0, 6),
      })
    }
  })

  return unique
}
