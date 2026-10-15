/**
 * ============================================================
 *  authSlice — user registration, login, logout
 * ============================================================
 *
 * IMPORTANT: this is a *frontend simulation* of authentication, which is
 * what the assignment asks for. There is no backend. "Accounts" are kept
 * in localStorage, and the password is lightly encoded with btoa() only so
 * it is not sitting in plain sight in devtools. That is NOT real security —
 * a production app must hash passwords on a server.
 */

import { createSlice } from '@reduxjs/toolkit'
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  STORAGE_KEYS,
} from '../../utils/localStorage'

/** Pretend "hashing" so the stored string isn't readable at a glance. */
const encode = (text) => btoa(unescape(encodeURIComponent(text)))

/**
 * The initial state is read straight out of localStorage.
 * This is what makes the login survive a page refresh (requirement 1).
 */
const initialState = {
  // The logged-in user: { id, name, email } — never the password.
  user: loadFromStorage(STORAGE_KEYS.currentUser, null),
  isAuthenticated: Boolean(loadFromStorage(STORAGE_KEYS.currentUser, null)),
  error: null,
  // Small success message shown on the login page after signing up.
  successMessage: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Create a new account.
     * payload: { name, email, password }
     */
    registerUser(state, action) {
      const { name, email, password } = action.payload
      const normalisedEmail = email.trim().toLowerCase()

      const users = loadFromStorage(STORAGE_KEYS.users, [])

      // Requirement: don't allow two accounts with the same email.
      const alreadyExists = users.some((u) => u.email === normalisedEmail)
      if (alreadyExists) {
        state.error = 'An account with that email already exists. Try logging in instead.'
        state.successMessage = null
        return
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        email: normalisedEmail,
        password: encode(password),
        createdAt: new Date().toISOString(),
      }

      saveToStorage(STORAGE_KEYS.users, [...users, newUser])

      state.error = null
      state.successMessage = 'Account created successfully. Please log in.'
    },

    /**
     * Log in an existing user.
     * payload: { email, password }
     */
    loginUser(state, action) {
      const { email, password } = action.payload
      const normalisedEmail = email.trim().toLowerCase()

      const users = loadFromStorage(STORAGE_KEYS.users, [])
      const match = users.find(
        (u) => u.email === normalisedEmail && u.password === encode(password)
      )

      if (!match) {
        state.user = null
        state.isAuthenticated = false
        state.error = 'Incorrect email or password.'
        return
      }

      // Strip the password out before putting the user into Redux / storage.
      const safeUser = { id: match.id, name: match.name, email: match.email }

      saveToStorage(STORAGE_KEYS.currentUser, safeUser)

      state.user = safeUser
      state.isAuthenticated = true
      state.error = null
      state.successMessage = null
    },

    /** Log out: clear Redux state and the stored session. */
    logoutUser(state) {
      removeFromStorage(STORAGE_KEYS.currentUser)

      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.successMessage = null
    },

    /** Clears both banners, e.g. when leaving the login page. */
    clearAuthMessages(state) {
      state.error = null
      state.successMessage = null
    },

    /**
     * Clears only the error, keeping any success message.
     *
     * The Register page uses this when it unmounts: it needs to drop a
     * stale error, but the "Account created — please log in" message has
     * to survive the redirect so the Login page can display it.
     */
    clearAuthError(state) {
      state.error = null
    },
  },
})

export const { registerUser, loginUser, logoutUser, clearAuthMessages, clearAuthError } =
  authSlice.actions

/* ---------- Selectors: small functions for `useSelector` ---------- */
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthError = (state) => state.auth.error
export const selectAuthSuccess = (state) => state.auth.successMessage

export default authSlice.reducer
