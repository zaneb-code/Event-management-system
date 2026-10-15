/**
 * ============================================================
 *  The Redux store
 * ============================================================
 *
 * `configureStore` is Redux Toolkit's replacement for the old
 * `createStore`. It wires up the Redux DevTools and sensible default
 * middleware (including thunk, which our createAsyncThunk calls need)
 * without any extra setup.
 *
 * The resulting state tree looks like this:
 *
 *   {
 *     auth:          { user, isAuthenticated, error, successMessage },
 *     events:        { list, filters, selectedEvent, categories, ... },
 *     registrations: { byUser, feedback }
 *   }
 */

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import eventsReducer from './slices/eventsSlice'
import registrationsReducer from './slices/registrationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    registrations: registrationsReducer,
  },
  // Turn the DevTools extension on in development only.
  devTools: import.meta.env.MODE !== 'production',
})

export default store
