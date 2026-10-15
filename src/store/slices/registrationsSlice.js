/**
 * ============================================================
 *  registrationsSlice — which events the logged-in user joined
 * ============================================================
 *
 * Shape of the state:
 *
 *   byUser: {
 *     "user_1699...": [ { id, name, date, venue, ..., registeredAt, tickets } ],
 *     "user_1700...": [ ... ]
 *   }
 *
 * Keying by user id is what "associate registration information with the
 * logged-in user" means (requirement 4) — each account sees only its own
 * registrations, and they survive a refresh because we mirror the whole
 * object into localStorage after every change.
 *
 * We store a *snapshot* of the event (name, date, venue, image) rather than
 * just the id, so the My Events page can render instantly without making
 * one API request per registered event.
 */

import { createSlice } from '@reduxjs/toolkit'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../../utils/localStorage'
import { isPastEvent } from '../../utils/format'

const initialState = {
  byUser: loadFromStorage(STORAGE_KEYS.registrations, {}),
  // Feedback shown as a toast after registering / cancelling.
  feedback: null, // { type: 'success' | 'error' | 'info', message: string }
}

/** Helper so we don't repeat the save line in every reducer. */
function persist(state) {
  saveToStorage(STORAGE_KEYS.registrations, state.byUser)
}

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {
    /**
     * Register the current user for an event.
     * payload: { userId, event, tickets }
     */
    registerForEvent(state, action) {
      const { userId, event, tickets = 1 } = action.payload

      if (!userId) {
        state.feedback = { type: 'error', message: 'Please log in to register for events.' }
        return
      }

      // Make sure this user has a list.
      if (!state.byUser[userId]) state.byUser[userId] = []

      // --- Prevent duplicate registration (requirement 4) ---
      const alreadyRegistered = state.byUser[userId].some((r) => r.id === event.id)
      if (alreadyRegistered) {
        state.feedback = {
          type: 'info',
          message: `You are already registered for "${event.name}".`,
        }
        return
      }

      state.byUser[userId].push({
        // Snapshot of the useful event fields
        id: event.id,
        name: event.name,
        image: event.image,
        date: event.date,
        time: event.time,
        venue: event.venue,
        city: event.city,
        state: event.state,
        country: event.country,
        segment: event.segment,
        genre: event.genre,
        url: event.url,
        // Registration info
        tickets,
        registeredAt: new Date().toISOString(),
        confirmationCode: `EV-${event.id.slice(-6).toUpperCase()}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
      })

      persist(state)

      state.feedback = {
        type: 'success',
        message: `You're registered for "${event.name}". Find it under My Events.`,
      }
    },

    /**
     * Cancel a registration.
     * payload: { userId, eventId }
     */
    cancelRegistration(state, action) {
      const { userId, eventId } = action.payload
      const list = state.byUser[userId]

      if (!list) return

      const target = list.find((r) => r.id === eventId)
      state.byUser[userId] = list.filter((r) => r.id !== eventId)

      persist(state)

      state.feedback = {
        type: 'info',
        message: target
          ? `Registration cancelled for "${target.name}".`
          : 'Registration cancelled.',
      }
    },

    /** Change how many tickets a registration is for. */
    updateTicketCount(state, action) {
      const { userId, eventId, tickets } = action.payload
      const registration = state.byUser[userId]?.find((r) => r.id === eventId)

      if (registration) {
        registration.tickets = Math.max(1, Math.min(10, tickets))
        persist(state)
      }
    },

    /** Dismiss the toast. */
    clearFeedback(state) {
      state.feedback = null
    },
  },
})

export const { registerForEvent, cancelRegistration, updateTicketCount, clearFeedback } =
  registrationsSlice.actions

/* ------------------------------------------------------------------
 *  Selectors
 *
 *  These read from two slices at once (auth + registrations), which is
 *  perfectly fine — a selector receives the whole Redux state.
 * ------------------------------------------------------------------ */

/** All registrations belonging to the logged-in user. */
export const selectMyRegistrations = (state) => {
  const userId = state.auth.user?.id
  if (!userId) return []
  return state.registrations.byUser[userId] ?? []
}

/** Newest first — nicer default order in My Events. */
export const selectMyRegistrationsSorted = (state) =>
  [...selectMyRegistrations(state)].sort(
    (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
  )

/** Split into upcoming vs completed (requirement 5). */
export const selectUpcomingRegistrations = (state) =>
  selectMyRegistrations(state)
    .filter((r) => !isPastEvent(r.date))
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))

export const selectCompletedRegistrations = (state) =>
  selectMyRegistrations(state)
    .filter((r) => isPastEvent(r.date))
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))

/** Used by the Register button to know if it should say "Registered". */
export const selectIsRegisteredFor = (eventId) => (state) =>
  selectMyRegistrations(state).some((r) => r.id === eventId)

export const selectRegistrationCount = (state) => selectMyRegistrations(state).length

export const selectFeedback = (state) => state.registrations.feedback

export default registrationsSlice.reducer
