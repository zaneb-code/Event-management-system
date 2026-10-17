import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'

import {
  registerUser,
  clearAuthError,
  selectAuthError,
  selectAuthSuccess,
} from '../store/slices/authSlice'
import { validateRegisterForm } from '../utils/format'

function passwordStrength(password) {
  let score = 0
  if (password.length >= 6) score += 1
  if (password.length >= 10) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const labels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong', 'Very strong']
  return { score, label: labels[score] }
}

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const authError = useSelector(selectAuthError)
  const authSuccess = useSelector(selectAuthSuccess)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  // Only the error is cleared on unmount — see clearAuthError in authSlice
  // for why the success message has to stay.
  useEffect(() => () => dispatch(clearAuthError()), [dispatch])

  /**
   * When the slice reports success, go to the login page. The success
   * message stays in Redux so Login can display it.
   */
  useEffect(() => {
    if (submitted && authSuccess) {
      const timer = setTimeout(() => navigate('/login'), 900)
      return () => clearTimeout(timer)
    }
  }, [submitted, authSuccess, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const validationErrors = validateRegisterForm(form)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) return

    dispatch(
      registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      })
    )
    setSubmitted(true)
  }

  const strength = passwordStrength(form.password)

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <h1>Create your account</h1>
          <p>It takes a few seconds, and your events stay saved in this browser.</p>
        </div>

        {authSuccess && <p className="form-banner form-banner--success">{authSuccess}</p>}
        {authError && (
          <p className="form-banner form-banner--error" role="alert">
            {authError}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={`input ${errors.name ? 'input--error' : ''}`}
              value={form.name}
              onChange={handleChange}
              placeholder="Ada Lovelace"
              autoComplete="name"
            />
            {errors.name && <span className="field__error">{errors.name}</span>}
          </div>

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
            <input
              id="password"
              name="password"
              type="password"
              className={`input ${errors.password ? 'input--error' : ''}`}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />

            {form.password && (
              <div className="strength">
                <div className="strength__bars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`strength__bar ${i < strength.score ? 'is-filled' : ''}`}
                      data-score={strength.score}
                    />
                  ))}
                </div>
                <span className="strength__label">{strength.label}</span>
              </div>
            )}

            {errors.password && <span className="field__error">{errors.password}</span>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className={`input ${errors.confirmPassword ? 'input--error' : ''}`}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <span className="field__error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn btn--primary btn--block">
            Create account
          </button>
        </form>

        <p className="auth-card__foot">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
