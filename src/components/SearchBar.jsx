import { useState, useEffect } from 'react'

export default function SearchBar({ value = '', onSearch, placeholder = 'Search events, artists, teams…' }) {
  const [text, setText] = useState(value)

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
