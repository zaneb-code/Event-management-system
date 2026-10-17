import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'
import RegisterButton from '../components/RegisterButton'

import {
  fetchEventDetails,
  clearSelectedEvent,
  selectSelectedEvent,
  selectDetailStatus,
  selectDetailError,
} from '../store/slices/eventsSlice'
import { selectIsRegisteredFor, selectMyRegistrations } from '../store/slices/registrationsSlice'
import {
  formatDate,
  formatTime,
  formatLocation,
  formatPriceRange,
  isPastEvent,
} from '../utils/format'

export default function EventDetails() {
  const { eventId } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const event = useSelector(selectSelectedEvent)
  const status = useSelector(selectDetailStatus)
  const error = useSelector(selectDetailError)
  const isRegistered = useSelector(selectIsRegisteredFor(eventId))
  const myRegistrations = useSelector(selectMyRegistrations)

  const myRegistration = myRegistrations.find((r) => r.id === eventId)

  // Fetch on mount / whenever the id in the URL changes,
  // and clear the slice when leaving so the next visit starts fresh.
  useEffect(() => {
    dispatch(fetchEventDetails(eventId))
    return () => dispatch(clearSelectedEvent())
  }, [eventId, dispatch])

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="container section">
        <Loader label="Loading event details…" />
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="container section">
        <ErrorMessage
          title="Could not load this event"
          message={error}
          onRetry={() => dispatch(fetchEventDetails(eventId))}
        />
        <p className="back-link">
          <Link to="/events">← Back to all events</Link>
        </p>
      </div>
    )
  }

  if (!event) return null

  const price = formatPriceRange(event)
  const past = isPastEvent(event.date)

  // Rows for the little details table — only the ones the API filled in.
  const detailRows = [
    { label: 'Date', value: formatDate(event.date) },
    { label: 'Time', value: event.time ? formatTime(event.time) : 'To be announced' },
    { label: 'Venue', value: event.venue },
    { label: 'Address', value: event.address },
    { label: 'Location', value: formatLocation(event) },
    { label: 'Category', value: [event.segment, event.genre].filter(Boolean).join(' › ') },
    { label: 'Sub-genre', value: event.subGenre },
    { label: 'Price range', value: price },
    { label: 'Ticket limit', value: event.ticketLimit },
    { label: 'Promoter', value: event.promoter },
    { label: 'Timezone', value: event.timezone },
    {
      label: 'Status',
      value: event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : null,
    },
  ].filter((row) => row.value)

  return (
    <article className="details">
      {/* ---------------- Banner ---------------- */}
      <header className="details__banner">
        {event.image && (
          <img className="details__banner-img" src={event.image} alt="" aria-hidden="true" />
        )}
        <div className="details__banner-shade" aria-hidden="true" />

        <div className="container details__banner-inner">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <div className="details__tags">
            <span className="tag tag--accent">{event.segment}</span>
            {event.genre && <span className="tag">{event.genre}</span>}
            {past && <span className="tag tag--muted">Completed</span>}
            {event.status === 'cancelled' && <span className="tag tag--warn">Cancelled</span>}
          </div>

          <h1 className="details__title">{event.name}</h1>

          <p className="details__summary">
            {formatDate(event.date)}
            {event.time && ` · ${formatTime(event.time)}`} · {event.venue}, {formatLocation(event)}
          </p>
        </div>
      </header>

      <div className="container details__body">
        {/* ---------------- Main column ---------------- */}
        <div className="details__main">
          {isRegistered && myRegistration && (
            <div className="notice notice--success">
              <div className="notice__icon" aria-hidden="true">
                ✓
              </div>
              <div className="notice__body">
                <h3>You&apos;re registered</h3>
                <p>
                  Confirmation code <code>{myRegistration.confirmationCode}</code> ·{' '}
                  {myRegistration.tickets} {myRegistration.tickets === 1 ? 'ticket' : 'tickets'} ·
                  registered on {formatDate(myRegistration.registeredAt.slice(0, 10))}
                </p>
                <Link to="/my-events" className="btn btn--ghost btn--sm">
                  Go to My Events
                </Link>
              </div>
            </div>
          )}

          {event.info && (
            <section className="details__section">
              <h2>About this event</h2>
              <p>{event.info}</p>
            </section>
          )}

          {event.pleaseNote && (
            <section className="details__section">
              <h2>Important information</h2>
              <p>{event.pleaseNote}</p>
            </section>
          )}

          <section className="details__section">
            <h2>Event details</h2>
            <dl className="detail-table">
              {detailRows.map((row) => (
                <div className="detail-table__row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {event.attractions.length > 0 && (
            <section className="details__section">
              <h2>Line-up</h2>
              <ul className="lineup">
                {event.attractions.map((attraction) => (
                  <li key={attraction.id} className="lineup__item">
                    {attraction.image ? (
                      <img src={attraction.image} alt="" />
                    ) : (
                      <span className="lineup__placeholder" aria-hidden="true">
                        ★
                      </span>
                    )}
                    <span>{attraction.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {event.seatmap && (
            <section className="details__section">
              <h2>Seat map</h2>
              <img className="seatmap" src={event.seatmap} alt={`Seat map for ${event.venue}`} />
            </section>
          )}
        </div>

        {/* ---------------- Sticky side card ---------------- */}
        <aside className="details__aside">
          <div className="ticket-card">
            <p className="ticket-card__label">Registration</p>
            <p className="ticket-card__price">{price ?? 'Price TBA'}</p>

            <ul className="ticket-card__facts">
              <li>
                <span>Date</span>
                <strong>{formatDate(event.date)}</strong>
              </li>
              {event.time && (
                <li>
                  <span>Time</span>
                  <strong>{formatTime(event.time)}</strong>
                </li>
              )}
              <li>
                <span>Venue</span>
                <strong>{event.venue}</strong>
              </li>
              <li>
                <span>City</span>
                <strong>{formatLocation(event)}</strong>
              </li>
            </ul>

            <RegisterButton event={event} block />

            {event.url && (
              <a className="btn btn--ghost btn--block" href={event.url} target="_blank" rel="noreferrer">
                View on Ticketmaster ↗
              </a>
            )}

            <p className="ticket-card__note">
              Registering here saves the event to your My Events list. It does not purchase a
              real ticket.
            </p>
          </div>
        </aside>
      </div>
    </article>
  )
}
