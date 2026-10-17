import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectFeedback, clearFeedback } from '../store/slices/registrationsSlice'

const ICONS = {
  success: '✓',
  error: '!',
  info: 'i',
}

export default function Toast() {
  const feedback = useSelector(selectFeedback)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!feedback) return

    const timer = setTimeout(() => dispatch(clearFeedback()), 4000)

    // Clearing the timer on unmount prevents the message from being
    // dismissed at the wrong moment if a new one arrives.
    return () => clearTimeout(timer)
  }, [feedback, dispatch])

  if (!feedback) return null

  return (
    <div className={`toast toast--${feedback.type}`} role="status" aria-live="polite">
      <span className="toast__icon">{ICONS[feedback.type] ?? 'i'}</span>
      <p>{feedback.message}</p>
      <button
        className="toast__close"
        onClick={() => dispatch(clearFeedback())}
        aria-label="Dismiss message"
      >
        ×
      </button>
    </div>
  )
}
