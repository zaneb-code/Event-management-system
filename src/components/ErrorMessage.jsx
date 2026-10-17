export default function ErrorMessage({ message, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="notice notice--error" role="alert">
      <div className="notice__icon" aria-hidden="true">
        !
      </div>
      <div className="notice__body">
        <h3>{title}</h3>
        <p>{message || 'Please try again in a moment.'}</p>
        {onRetry && (
          <button className="btn btn--primary btn--sm" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    </div>
  )
}


export function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}
