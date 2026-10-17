import { createSlice } from '@reduxjs/toolkit'
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from '../../utils/localStorage'
import { isPastEvent } from '../../utils/format'

const initialState = {
  byUser: loadFromStorage(STORAGE_KEYS.registrations, {}),
  feedback: null, 
  sortBy: 'date',
}
function persist(state) {
  saveToStorage(STORAGE_KEYS.registrations, state.byUser)
}

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {
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
    updateTicketCount(state, action) {
      const { userId, eventId, tickets } = action.payload
      const registration = state.byUser[userId]?.find((r) => r.id === eventId)

      if (registration) {
        registration.tickets = Math.max(1, Math.min(10, tickets))
        persist(state)
      }
    },
    setSortBy(state, action) {
      state.sortBy = action.payload
    },

    /** Dismiss the toast. */
    clearFeedback(state) {
      state.feedback = null
    },
  },
})

export const {
  registerForEvent,
  cancelRegistration,
  updateTicketCount,
  setSortBy,
  clearFeedback,
} = registrationsSlice.actions


export const selectMyRegistrations = (state) => {
  const userId = state.auth.user?.id
  if (!userId) return []
  return state.registrations.byUser[userId] ?? []
}
export const selectMyRegistrationsSorted = (state) =>
  [...selectMyRegistrations(state)].sort(
    (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
  )
function sortRegistrations(list, sortBy, newestDateFirst = false) {
  const sorted = [...list]

  if (sortBy === 'recent') {
    // Most recently registered first
    return sorted.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
  }

  if (sortBy === 'name') {  
    return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
  return sorted.sort((a, b) =>
    newestDateFirst
      ? (b.date ?? '').localeCompare(a.date ?? '')
      : (a.date ?? '').localeCompare(b.date ?? '')
  )
}
export const selectUpcomingRegistrations = (state) =>
  sortRegistrations(
    selectMyRegistrations(state).filter((r) => !isPastEvent(r.date)),
    state.registrations.sortBy
  )

export const selectCompletedRegistrations = (state) =>
  sortRegistrations(
    selectMyRegistrations(state).filter((r) => isPastEvent(r.date)),
    state.registrations.sortBy,
    true
  )

export const selectSortBy = (state) => state.registrations.sortBy

export const selectIsRegisteredFor = (eventId) => (state) =>
  selectMyRegistrations(state).some((r) => r.id === eventId)

export const selectRegistrationCount = (state) => selectMyRegistrations(state).length

export const selectFeedback = (state) => state.registrations.feedback

export default registrationsSlice.reducer