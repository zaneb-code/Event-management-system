import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__brand">
            Event<span className="brand__accent">ia</span>
          </p>
          <p className="footer__note">
            Zainab Khalid Developer of this WebSite. Event data from the
            Ticketmaster Discovery API.
          </p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <Link to="/events">Browse events</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/my-events">My events</Link>
          <a
            href="https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/"
            target="_blank"
            rel="noreferrer"
          >
            API docs
          </a>
        </nav>
      </div>

      <div className="container footer__bottom">
        <span>Built with React, Redux Toolkit &amp; React Router.</span>
        <span>© {new Date().getFullYear()} Eventia</span>
      </div>
    </footer>
  )
}
