import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../../api/ticketmaster'
import { todayAsApiDate } from '../../utils/format'
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (params, { rejectWithValue }) => {
    try {
      return await api.fetchEvents(params)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcomingEvents',
  async (_, { rejectWithValue }) => {
    try {
      const { events } = await api.fetchEvents({
        startDateTime: todayAsApiDate(),
        sort: 'date,asc',
        size: 6,
      })
      return events
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/** One event, for the Event Details page. */
export const fetchEventDetails = createAsyncThunk(
  'events/fetchEventDetails',
  async (eventId, { rejectWithValue }) => {
    try {
      return await api.fetchEventById(eventId)
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

/** Event categories (Ticketmaster "segments"). */
export const fetchCategories = createAsyncThunk(
  'events/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await api.fetchCategories()
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)
export const defaultFilters = {
  keyword: '',
  city: '',
  countryCode: '',
  classificationName: '',
  sort: 'date,asc',
  upcomingOnly: true,
}

const initialState = {
  // Events list
  list: [],
  listStatus: 'idle',
  listError: null,
  page: { number: 0, size: 12, totalPages: 0, totalElements: 0 },

  
  filters: { ...defaultFilters },

  
  upcoming: [],
  upcomingStatus: 'idle',
  upcomingError: null,

  // Event details page
  selectedEvent: null,
  detailStatus: 'idle',
  detailError: null,

  // Categories page
  categories: [],
  categoriesStatus: 'idle',
  categoriesError: null,
}

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
      state.page.number = 0 
    },

    resetFilters(state) {
      state.filters = { ...defaultFilters }
      state.page.number = 0
    },

    setPage(state, action) {
      state.page.number = action.payload
    },

    /** Clear the details page when we navigate away. */
    clearSelectedEvent(state) {
      state.selectedEvent = null
      state.detailStatus = 'idle'
      state.detailError = null
    },
  },

  // `extraReducers` handles the actions created by our thunks.
  extraReducers: (builder) => {
    builder
      // ---- Events list ----
      .addCase(fetchEvents.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.list = action.payload.events
        state.page = action.payload.page
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.payload ?? 'Something went wrong loading events.'
        state.list = []
      })

      // ---- Upcoming (home page) ----
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.upcomingStatus = 'loading'
        state.upcomingError = null
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.upcomingStatus = 'succeeded'
        state.upcoming = action.payload
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.upcomingStatus = 'failed'
        state.upcomingError = action.payload ?? 'Could not load upcoming events.'
      })

      // ---- Single event details ----
      .addCase(fetchEventDetails.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = null
        state.selectedEvent = null
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.selectedEvent = action.payload
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.payload ?? 'Could not load this event.'
      })

      // ---- Categories ----
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = 'loading'
        state.categoriesError = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = 'succeeded'
        state.categories = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesStatus = 'failed'
        state.categoriesError = action.payload ?? 'Could not load categories.'
      })
  },
})

export const { setFilters, resetFilters, setPage, clearSelectedEvent } = eventsSlice.actions

/* ---------- Selectors ---------- */
export const selectEvents = (state) => state.events.list
export const selectEventsStatus = (state) => state.events.listStatus
export const selectEventsError = (state) => state.events.listError
export const selectEventsPage = (state) => state.events.page
export const selectFilters = (state) => state.events.filters

export const selectUpcoming = (state) => state.events.upcoming
export const selectUpcomingStatus = (state) => state.events.upcomingStatus

export const selectSelectedEvent = (state) => state.events.selectedEvent
export const selectDetailStatus = (state) => state.events.detailStatus
export const selectDetailError = (state) => state.events.detailError

export const selectCategories = (state) => state.events.categories
export const selectCategoriesStatus = (state) => state.events.categoriesStatus
export const selectCategoriesError = (state) => state.events.categoriesError

export default eventsSlice.reducer