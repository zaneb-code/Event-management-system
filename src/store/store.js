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
