import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import EventCard from '../components/EventCard'
import Pagination from '../components/Pagination'
import ErrorMessage, { EmptyState } from '../components/ErrorMessage'
import { SkeletonGrid } from '../components/Loader'
import ApiKeyNotice from '../components/ApiKeyNotice'

import {
  fetchEvents,
  setFilters,
  resetFilters,
  setPage,
  selectEvents,
  selectEventsStatus,
  selectEventsError,
  selectEventsPage,
  selectFilters,
} from '../store/slices/eventsSlice'
import { todayAsApiDate } from '../utils/format'
import { hasApiKey } from '../api/ticketmaster'

export default function Events() {
  const dispatch = useDispatch()

  const events = useSelector(selectEvents)
  const status = useSelector(selectEventsStatus)
  const error = useSelector(selectEventsError)
  const page = useSelector(selectEventsPage)
  const filters = useSelector(selectFilters)

  const [filtersOpen, setFiltersOpen] = useState(false)
  useEffect(() => {
    if (!hasApiKey) return

    const timer = setTimeout(() => {
      dispatch(
        fetchEvents({
          keyword: filters.keyword,
          city: filters.city,
          countryCode: filters.countryCode,
          classificationName: filters.classificationName,
          startDateTime: filters.upcomingOnly ? todayAsApiDate() : '',
          sort: filters.sort,
          page: page.number,
          size: 9,
        })
      )
    }, 450)

    return () => clearTimeout(timer)
  }, [
    dispatch,
    filters.keyword,
    filters.city,
    filters.countryCode,
    filters.classificationName,
    filters.upcomingOnly,
    filters.sort,
    page.number,
  ])

  const handleFilterChange = (changes) => dispatch(setFilters(changes))

  function handlePageChange(nextPage) {
    dispatch(setPage(nextPage))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Describes the current result set in words, e.g. "Music events in Boston"
  const resultLabel = [
    filters.classificationName || 'All',
    'events',
    filters.keyword ? `matching “${filters.keyword}”` : '',
    filters.city ? `in ${filters.city}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="container section">
      <header className="page-head">
        <h1 className="page-title">Explore events</h1>
        <p className="page-sub">
          Live data from the Ticketmaster Discovery API — search, filter and register.
        </p>
      </header>

      <ApiKeyNotice />

      <div className="events-toolbar">
        <SearchBar
          value={filters.keyword}
          onSearch={(keyword) => dispatch(setFilters({ keyword }))}
        />
        <button
          className="btn btn--ghost filters-toggle"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? 'Hide filters' : 'Show filters'}
        </button>
      </div>

      <div className="events-layout">
        <div className={`events-layout__aside ${filtersOpen ? 'is-open' : ''}`}>
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={() => dispatch(resetFilters())}
            resultCount={status === 'succeeded' ? page.totalElements : undefined}
          />
        </div>

        <div className="events-layout__main">
          <div className="results-head">
            <h2 className="results-title">{resultLabel}</h2>
            {status === 'succeeded' && page.totalElements > 0 && (
              <p className="results-count">
                Page {page.number + 1} of{' '}
                {Math.min(page.totalPages, Math.floor(1000 / page.size)).toLocaleString()}
              </p>
            )}
          </div>

          {/* ---- Loading ---- */}
          {status === 'loading' && <SkeletonGrid count={9} />}

          {/* ---- Error ---- */}
          {status === 'failed' && (
            <ErrorMessage
              message={error}
              onRetry={() =>
                dispatch(
                  fetchEvents({
                    keyword: filters.keyword,
                    city: filters.city,
                    countryCode: filters.countryCode,
                    classificationName: filters.classificationName,
                    startDateTime: filters.upcomingOnly ? todayAsApiDate() : '',
                    sort: filters.sort,
                    page: page.number,
                    size: 9,
                  })
                )
              }
            />
          )}

          {/* ---- Empty ---- */}
          {status === 'succeeded' && events.length === 0 && (
            <EmptyState
              title="No events found"
              message="Try a different keyword, widen the location, or reset the filters."
              action={
                <button className="btn btn--primary btn--sm" onClick={() => dispatch(resetFilters())}>
                  Reset filters
                </button>
              }
            />
          )}

          {/* ---- Results ---- */}
          {status === 'succeeded' && events.length > 0 && (
            <>
              <div className="grid grid--cards">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              <Pagination
                page={page.number}
                totalPages={page.totalPages}
                size={page.size}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
