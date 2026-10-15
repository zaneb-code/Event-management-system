/**
 * RegisterButton — the reusable "Register / Cancel registration" control.
 *
 * Used on both the event card and the event details page, which is exactly
 * the point of a reusable component: the duplicate-registration rule and
 * the "log in first" rule are written once, here.
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import { selectCurrentUser, selectIsAuthenticated } from '../store/slices/authSlice'
import {
  registerForEvent,
  cancelRegistration,
  selectIsRegisteredFor,
} from '../store/slices/registrationsSlice'
import { isPastEvent } from '../utils/format'

export default function RegisterButton({ event, size = 'md', block = false }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isRegistered = useSelector(selectIsRegisteredFor(event.id))

  const isPast = isPastEvent(event.date)
  const isCancelled = event.status === 'cancelled'

  const classes = [
    'btn',
    size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    isRegistered ? 'btn--registered' : 'btn--primary',
  ]
    .filter(Boolean)
    .join(' ')

  // Not logged in → send to login, remembering where we came from.
  function handleClick() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    if (isRegistered) {
      dispatch(cancelRegistration({ userId: user.id, eventId: event.id }))
    } else {
      dispatch(registerForEvent({ userId: user.id, event }))
    }
  }

  if (isCancelled) {
    return (
      <button className={`btn ${size === 'sm' ? 'btn--sm' : ''} btn--disabled`} disabled>
        Event cancelled
      </button>
    )
  }

  if (isPast && !isRegistered) {
    return (
      <button className={`btn ${size === 'sm' ? 'btn--sm' : ''} btn--disabled`} disabled>
        Event finished
      </button>
    )
  }

  return (
    <button className={classes} onClick={handleClick}>
      {isRegistered ? (
        <>
          <span aria-hidden="true">✓</span> Registered — cancel?
        </>
      ) : isAuthenticated ? (
        'Register for event'
      ) : (
        'Log in to register'
      )}
    </button>
  )
}
