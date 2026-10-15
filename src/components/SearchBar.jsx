/**
 * SearchBar — free-text event search (requirement 2).
 *
 * The typed text is kept in local component state while typing, and only
 * pushed into Redux when the form is submitted. That keeps us well under
 * Ticketmaster's 2-requests-per-second limit (we would blow straight
 * through it if we searched on every keystroke).
 */

import { useState, useEffect } from 'react'

export default function SearchBar({ value = '', onSearch, placeholder = 'Search events, artists, teams…' }) {
  const [text, setText] = useState(value)

  // Keep the input in sync if the filter is cleared from elsewhere
  // (for example the "Reset filters" button).
  useEffect(() => {
    setText(value)
  }, [value])

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(text.trim())
  }

  function handleClear() {
    setText('')
    onSearch('')
  }

  return (
    <form className="searchbar" onSubmit={handleSubmit} role="search">
      <span className="searchbar__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>

      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label="Search events"
      />

      {text && (
        <button type="button" className="searchbar__clear" onClick={handleClear} aria-label="Clear search">
          ×
        </button>
      )}

      <button type="submit" className="btn btn--primary searchbar__submit">
        Search
      </button>
    </form>
  )
}
