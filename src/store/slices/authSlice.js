import { createSlice } from '@reduxjs/toolkit'
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  STORAGE_KEYS,
} from '../../utils/localStorage'


const encode = (text) => btoa(unescape(encodeURIComponent(text)))


const initialState = {
  
  user: loadFromStorage(STORAGE_KEYS.currentUser, null),
  isAuthenticated: Boolean(loadFromStorage(STORAGE_KEYS.currentUser, null)),
  error: null,
  
  successMessage: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
   
    registerUser(state, action) {
      const { name, email, password } = action.payload
      const normalisedEmail = email.trim().toLowerCase()

      const users = loadFromStorage(STORAGE_KEYS.users, [])

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

     
      const safeUser = { id: match.id, name: match.name, email: match.email }

      saveToStorage(STORAGE_KEYS.currentUser, safeUser)

      state.user = safeUser
      state.isAuthenticated = true
      state.error = null
      state.successMessage = null
    },

   
    logoutUser(state) {
      removeFromStorage(STORAGE_KEYS.currentUser)

      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.successMessage = null
    },

    
    clearAuthMessages(state) {
      state.error = null
      state.successMessage = null
    },

   
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
