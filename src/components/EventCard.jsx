/**
 * EventCard — one event in a grid. Reused by Home, Events and Categories.
 *
 * Props:
 *   event      the normalised event object from our API helper
 *   compact    smaller variant without the register button
 */

import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

import RegisterButton from './RegisterButton'
import { selectIsRegisteredFor } from '../store/slices/registrationsSlice'
import { formatDate, formatTime, formatLocation, formatPriceRange } from '../utils/format'

export default function EventCard({ event, compact = false }) {
  const isRegistered = useSelector(selectIsRegisteredFor(event.id))
  const price = formatPriceRange(event)

  return (
    <article className={`card ${compact ? 'card--compact' : ''}`}>
      <Link to={`/events/${event.id}`} className="card__media">
        {event.image ? (
          <img src={event.image} alt={event.name} loading="lazy" />
        ) : (
          <div className="card__media-fallback" aria-hidden="true">
            🎟
          </div>
        )}

        <span className="card__segment">{event.segment}</span>

        {isRegistered && (
          <span className="card__flag" title="You are registered for this event">
            ✓ Registered
          </span>
        )}

        {event.status === 'cancelled' && <span className="card__flag card__flag--warn">Cancelled</span>}
      </Link>

      <div className="card__body">
        <p className="card__date">
          <span className="card__date-day">{formatDate(event.date)}</span>
          {event.time && <span className="card__date-time">{formatTime(event.time)}</span>}
        </p>

        <h3 className="card__title">
          <Link to={`/events/${event.id}`}>{event.name}</Link>
        </h3>

        <p className="card__meta">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 21s-7-5.6-7-11a7 7 0 1 1 14 0c0 5.4-7 11-7 11Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
          <span>
            {event.venue}
            <span className="card__city"> · {formatLocation(event)}</span>
          </span>
        </p>

        {!compact && (
          <div className="card__footer">
            <span className="card__price">{price ?? 'Price TBA'}</span>
            <RegisterButton event={event} size="sm" />
          </div>
        )}
      </div>
    </article>
  )
}
