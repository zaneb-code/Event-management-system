import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import {
  logoutUser,
  selectCurrentUser,
  selectIsAuthenticated,
} from '../store/slices/authSlice'
import { selectRegistrationCount } from '../store/slices/registrationsSlice'
import { getInitials } from '../utils/format'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const user = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const registrationCount = useSelector(selectRegistrationCount)
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  function handleLogout() {
    setMenuOpen(false)
    setLoggingOut(true)
    navigate('/', { replace: true })
  }

  useEffect(() => {
    if (loggingOut && location.pathname === '/') {
      setLoggingOut(false)
      dispatch(logoutUser())
    }
  }, [loggingOut, location.pathname, dispatch])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6Z" />
              <path d="M12 7v10" strokeDasharray="2 3" />
            </svg>
          </span>
          <span className="brand__text">
            Event<span className="brand__accent">ia</span>
          </span>
        </Link>

        {/* Hamburger; only visible on small screens */}
        <button
          className="navbar__toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className={`burger ${menuOpen ? 'burger--open' : ''}`} />
        </button>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className="navbar__links">
            <li>
              <NavLink to="/" onClick={closeMenu} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/events" onClick={closeMenu}>
                Events
              </NavLink>
            </li>
            <li>
              <NavLink to="/categories" onClick={closeMenu}>
                Categories
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to="/my-events" onClick={closeMenu}>
                  My Events
                  {registrationCount > 0 && (
                    <span className="badge">{registrationCount}</span>
                  )}
                </NavLink>
              </li>
            )}
          </ul>

          <div className="navbar__auth">
            {isAuthenticated ? (
              <>
                <div className="user-chip" title={user.email}>
                  <span className="user-chip__avatar">{getInitials(user.name)}</span>
                  <span className="user-chip__name">{user.name}</span>
                </div>
                <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm" onClick={closeMenu}>
                  Log in
                </Link>
                <Link to="/register" className="btn btn--primary btn--sm" onClick={closeMenu}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
