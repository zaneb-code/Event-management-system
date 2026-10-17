import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import EventCard from '../components/EventCard'
import SearchBar from '../components/SearchBar'
import ErrorMessage from '../components/ErrorMessage'
import { SkeletonGrid } from '../components/Loader'
import ApiKeyNotice from '../components/ApiKeyNotice'

import {
  fetchUpcomingEvents,
  setFilters,
  selectUpcoming,
  selectUpcomingStatus,
} from '../store/slices/eventsSlice'
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice'
import { selectRegistrationCount } from '../store/slices/registrationsSlice'
import { hasApiKey } from '../api/ticketmaster'

const QUICK_CATEGORIES = [
  { name: 'Music', emoji: '🎵' },
  { name: 'Sports', emoji: '🏟' },
  { name: 'Arts & Theatre', emoji: '🎭' },
  { name: 'Film', emoji: '🎬' },
]

export default function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const upcoming = useSelector(selectUpcoming)
  const status = useSelector(selectUpcomingStatus)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const registrationCount = useSelector(selectRegistrationCount)

  // Fetch once on mount — but only if we don't already have the data
  // (coming back from another page shouldn't re-fetch).
  useEffect(() => {
    if (status === 'idle' && hasApiKey) {
      dispatch(fetchUpcomingEvents())
    }
  }, [status, dispatch, hasApiKey])

  /** Search from the hero: store the keyword, then jump to /events. */
  function handleSearch(keyword) {
    dispatch(setFilters({ keyword }))
    navigate('/events')
  }

  function handleCategory(name) {
    dispatch(setFilters({ classificationName: name, keyword: '' }))
    navigate('/events')
  }

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <div className="container hero__inner">
          <p className="hero__eyebrow">Live events, powered by Ticketmaster</p>

          <h1 className="hero__title">
            Find the night
            <br />
            you&apos;ll talk about
            <span className="hero__dot">.</span>
          </h1>

          <p className="hero__sub">
            Search thousands of concerts, matches and shows, register in one click, and keep
            every ticket in one place.
          </p>

          <div className="hero__search">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="hero__chips">
            {QUICK_CATEGORIES.map((category) => (
              <button
                key={category.name}
                className="chip chip--lg"
                onClick={() => handleCategory(category.name)}
              >
                <span aria-hidden="true">{category.emoji}</span> {category.name}
              </button>
            ))}
          </div>

          {isAuthenticated ? (
            <p className="hero__welcome">
              Welcome back, <strong>{user.name.split(' ')[0]}</strong> — you have{' '}
              <Link to="/my-events">
                {registrationCount} registered {registrationCount === 1 ? 'event' : 'events'}
              </Link>
              .
            </p>
          ) : (
            <p className="hero__welcome">
              <Link to="/register">Create a free account</Link> to start registering for events.
            </p>
          )}
        </div>
      </section>

      <div className="container">
        <ApiKeyNotice />
      </div>

      {/* ---------------- Upcoming events ---------------- */}
      <section className="container section">
        <div className="section__head">
          <div>
            <h2 className="section__title">Happening soon</h2>
            <p className="section__sub">The next events going on sale near you.</p>
          </div>
          <Link to="/events" className="btn btn--ghost btn--sm">
            Browse all events →
          </Link>
        </div>

        {status === 'loading' && <SkeletonGrid count={6} />}

        {status === 'failed' && (
          <ErrorMessage
            message="We couldn't load upcoming events."
            onRetry={() => dispatch(fetchUpcomingEvents())}
          />
        )}

        {status === 'succeeded' && (
          <div className="grid grid--cards">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="container section">
        <h2 className="section__title">How it works</h2>
        <div className="grid grid--steps">
          {[
            {
              step: '01',
              title: 'Create an account',
              text: 'Sign up with your name, email and a password. Your session is remembered after a refresh.',
            },
            {
              step: '02',
              title: 'Explore and filter',
              text: 'Search by keyword, narrow by category, city or country, and sort however you like.',
            },
            {
              step: '03',
              title: 'Register in one click',
              text: 'Register for any upcoming event. Duplicate registrations are blocked automatically.',
            },
            {
              step: '04',
              title: 'Manage My Events',
              text: 'See upcoming and completed events separately, and cancel whenever you need to.',
            },
          ].map((item) => (
            <article key={item.step} className="step-card">
              <span className="step-card__num">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
