import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container section notfound">
      <p className="notfound__code">404</p>
      <h1>This page doesn&apos;t exist</h1>
      <p className="notfound__text">
        The link may be broken, or the page may have moved. Let&apos;s get you back to the
        events.
      </p>
      <div className="notfound__actions">
        <Link to="/" className="btn btn--ghost">
          Go home
        </Link>
        <Link to="/events" className="btn btn--primary">
          Browse events
        </Link>
      </div>
    </div>
  )
}
