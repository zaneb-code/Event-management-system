import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { EmptyState } from '../components/ErrorMessage'
import { selectCurrentUser } from '../store/slices/authSlice'
import {
  cancelRegistration,
  updateTicketCount,
  setSortBy,
  selectUpcomingRegistrations,
  selectCompletedRegistrations,
  selectSortBy,
} from '../store/slices/registrationsSlice'
import { formatDate, formatTime, formatLocation, getInitials } from '../utils/format'

function RegistrationRow({ registration, isPast, onCancel, onTickets }) {
  return (
    <article className={`reg-row ${isPast ? 'reg-row--past' : ''}`}>
      <Link to={`/events/${registration.id}`} className="reg-row__media">
        {registration.image ? (
          <img src={registration.image} alt="" loading="lazy" />
        ) : (
          <span aria-hidden="true">🎟</span>
        )}
      </Link>

      <div className="reg-row__info">
        <p className="reg-row__date">
          {formatDate(registration.date)}
          {registration.time && ` · ${formatTime(registration.time)}`}
        </p>

        <h3>
          <Link to={`/events/${registration.id}`}>{registration.name}</Link>
        </h3>

        <p className="reg-row__venue">
          {registration.venue} · {formatLocation(registration)}
        </p>

        <p className="reg-row__code">
          <span className="tag tag--muted">{registration.segment}</span>
          <code>{registration.confirmationCode}</code>
        </p>
      </div>

      <div className="reg-row__actions">
        {!isPast ? (
          <>
            <div className="qty">
              <span className="qty__label">Tickets</span>
              <div className="qty__controls">
                <button
                  onClick={() => onTickets(registration.tickets - 1)}
                  disabled={registration.tickets <= 1}
                  aria-label="Decrease ticket count"
                >
                  −
                </button>
                <span className="qty__value">{registration.tickets}</span>
                <button
                  onClick={() => onTickets(registration.tickets + 1)}
                  disabled={registration.tickets >= 10}
                  aria-label="Increase ticket count"
                >
                  +
                </button>
              </div>
            </div>

            <button className="btn btn--danger btn--sm" onClick={onCancel}>
              Cancel registration
            </button>
          </>
        ) : (
          <>
            <span className="tag tag--muted">Attended · {registration.tickets} ticket(s)</span>
            <button className="btn btn--ghost btn--sm" onClick={onCancel}>
              Remove from list
            </button>
          </>
        )}
      </div>
    </article>
  )
}

export default function MyEvents() {
  const dispatch = useDispatch()

  const user = useSelector(selectCurrentUser)
  const upcoming = useSelector(selectUpcomingRegistrations)
  const completed = useSelector(selectCompletedRegistrations)
  const sortBy = useSelector(selectSortBy)

  const [tab, setTab] = useState('upcoming')

  const list = tab === 'upcoming' ? upcoming : completed
  const total = upcoming.length + completed.length

  const handleCancel = (eventId) => dispatch(cancelRegistration({ userId: user.id, eventId }))

  const handleTickets = (eventId, tickets) =>
    dispatch(updateTicketCount({ userId: user.id, eventId, tickets }))

  return (
    <div className="container section">
      {/* ---------------- Header with user summary ---------------- */}
      <header className="my-head">
        <div className="my-head__user">
          <span className="my-head__avatar">{getInitials(user.name)}</span>
          <div>
            <h1 className="page-title">My events</h1>
            <p className="page-sub">
              {user.name} · {user.email}
            </p>
          </div>
        </div>

        <div className="my-head__stats">
          <div className="stat">
            <strong>{total}</strong>
            <span>Total</span>
          </div>
          <div className="stat">
            <strong>{upcoming.length}</strong>
            <span>Upcoming</span>
          </div>
          <div className="stat">
            <strong>{completed.length}</strong>
            <span>Completed</span>
          </div>
        </div>
      </header>

      {/* ---------------- Tabs + sort ---------------- */}
      <div className="my-toolbar">
        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'upcoming'}
            className={`tab ${tab === 'upcoming' ? 'tab--active' : ''}`}
            onClick={() => setTab('upcoming')}
          >
            Upcoming <span className="tab__count">{upcoming.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'completed'}
            className={`tab ${tab === 'completed' ? 'tab--active' : ''}`}
            onClick={() => setTab('completed')}
          >
            Completed <span className="tab__count">{completed.length}</span>
          </button>
        </div>

        {}
        <label className="sort-field">
          <span>Sort by</span>
          <select
            className="input"
            value={sortBy}
            onChange={(e) => dispatch(setSortBy(e.target.value))}
          >
            <option value="date">Event date</option>
            <option value="recent">Recently registered</option>
            <option value="name">Event name (A–Z)</option>
          </select>
        </label>
      </div>

      {/* ---------------- List ---------------- */}
      {list.length === 0 ? (
        <EmptyState
          title={
            tab === 'upcoming' ? 'No upcoming events yet' : 'No completed events yet'
          }
          message={
            tab === 'upcoming'
              ? 'Browse events and register for the ones you like — they will show up here.'
              : 'Events you registered for move here automatically once their date passes.'
          }
          action={
            <Link to="/events" className="btn btn--primary btn--sm">
              Explore events
            </Link>
          }
        />
      ) : (
        <div className="reg-list">
          {list.map((registration) => (
            <RegistrationRow
              key={registration.id}
              registration={registration}
              isPast={tab === 'completed'}
              onCancel={() => handleCancel(registration.id)}
              onTickets={(tickets) => handleTickets(registration.id, tickets)}
            />
          ))}
        </div>
      )}
    </div>
  )
}