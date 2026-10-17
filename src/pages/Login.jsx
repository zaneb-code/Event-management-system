import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import {
  loginUser,
  clearAuthMessages,
  selectIsAuthenticated,
  selectAuthError,
  selectAuthSuccess,
} from '../store/slices/authSlice'
import { validateLoginForm } from '../utils/format'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = useSelector(selectIsAuthenticated)
  const authError = useSelector(selectAuthError)
  const authSuccess = useSelector(selectAuthSuccess)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // Where to go after logging in: back where they came from, or My Events.
  const redirectTo = location.state?.from ?? '/my-events'

  // Clear any leftover banner when we leave the page.
  useEffect(() => () => dispatch(clearAuthMessages()), [dispatch])

  // Once Redux says we're authenticated, move on.
  useEffect(() => {
    if (isAuthenticated) navigate(redirectTo, { replace: true })
  }, [isAuthenticated, navigate, redirectTo])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Clear that field's error as soon as the user starts fixing it.
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const validationErrors = validateLoginForm(form)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    dispatch(loginUser(form))
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <h1>Welcome back</h1>
          <p>Log in to register for events and manage your bookings.</p>
        </div>

        {authSuccess && <p className="form-banner form-banner--success">{authSuccess}</p>}
        {authError && (
          <p className="form-banner form-banner--error" role="alert">
            {authError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`input ${errors.email ? 'input--error' : ''}`}
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <span className="field__error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'input--error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-wrap__toggle"
                onClick={() => setShowPassword((show) => !show)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className="field__error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn--primary btn--block">
            Log in
          </button>
        </form>

        <p className="auth-card__foot">
          Don&apos;t have an account? <Link to="/register">Sign up free</Link>
        </p>

        <p className="auth-card__hint">
          Accounts are stored in your browser&apos;s local storage — this is a frontend
          authentication simulation, as the assignment specifies.
        </p>
      </div>
    </div>
  )
}
