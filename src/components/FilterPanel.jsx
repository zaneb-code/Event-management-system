/**
 * FilterPanel — filter the events list (requirement 2).
 *
 * Filters offered:
 *   - Category  (Ticketmaster "classificationName": Music, Sports, …)
 *   - City      (free text, e.g. "London")
 *   - Country   (two-letter code the API expects)
 *   - Sort      (date / name / relevance)
 *   - Upcoming only (adds startDateTime = today)
 *
 * The values live in Redux (`events.filters`) so the Events page can turn
 * them straight into API parameters, and so a category clicked on the
 * Categories page arrives here already applied.
 */

const CATEGORIES = ['Music', 'Sports', 'Arts & Theatre', 'Film', 'Miscellaneous']

const COUNTRIES = [
  { code: '', label: 'Any country' },
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'IE', label: 'Ireland' },
  { code: 'AU', label: 'Australia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'MX', label: 'Mexico' },
]

const SORTS = [
  { value: 'date,asc', label: 'Date — soonest first' },
  { value: 'date,desc', label: 'Date — latest first' },
  { value: 'name,asc', label: 'Name — A to Z' },
  { value: 'name,desc', label: 'Name — Z to A' },
  { value: 'relevance,desc', label: 'Most relevant' },
]

export default function FilterPanel({ filters, onChange, onReset, resultCount }) {
  // Did the user change anything from the defaults?
  const hasActiveFilters =
    filters.keyword || filters.city || filters.countryCode || filters.classificationName

  return (
    <aside className="filters" aria-label="Event filters">
      <div className="filters__head">
        <h2>Filters</h2>
        {hasActiveFilters && (
          <button className="link-btn" onClick={onReset}>
            Reset all
          </button>
        )}
      </div>

      {/* --- Category --- */}
      <div className="filters__group">
        <span className="filters__label">Category</span>
        <div className="chip-row">
          <button
            className={`chip ${!filters.classificationName ? 'chip--active' : ''}`}
            onClick={() => onChange({ classificationName: '' })}
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`chip ${filters.classificationName === category ? 'chip--active' : ''}`}
              onClick={() => onChange({ classificationName: category })}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* --- City --- */}
      <div className="filters__group">
        <label className="filters__label" htmlFor="filter-city">
          City
        </label>
        <input
          id="filter-city"
          type="text"
          className="input"
          placeholder="e.g. New York"
          value={filters.city}
          onChange={(e) => onChange({ city: e.target.value })}
        />
        <p className="filters__hint">Press Search or change another filter to apply.</p>
      </div>

      {/* --- Country --- */}
      <div className="filters__group">
        <label className="filters__label" htmlFor="filter-country">
          Country
        </label>
        <select
          id="filter-country"
          className="input"
          value={filters.countryCode}
          onChange={(e) => onChange({ countryCode: e.target.value })}
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {/* --- Sort --- */}
      <div className="filters__group">
        <label className="filters__label" htmlFor="filter-sort">
          Sort by
        </label>
        <select
          id="filter-sort"
          className="input"
          value={filters.sort}
          onChange={(e) => onChange({ sort: e.target.value })}
        >
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>

      {/* --- Upcoming only --- */}
      <div className="filters__group">
        <label className="switch">
          <input
            type="checkbox"
            checked={filters.upcomingOnly}
            onChange={(e) => onChange({ upcomingOnly: e.target.checked })}
          />
          <span className="switch__track" aria-hidden="true">
            <span className="switch__thumb" />
          </span>
          <span>Upcoming events only</span>
        </label>
      </div>

      {typeof resultCount === 'number' && (
        <p className="filters__count">
          <strong>{resultCount.toLocaleString()}</strong> events match
        </p>
      )}
    </aside>
  )
}
