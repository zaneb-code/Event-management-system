# Eventia — Event Management System

A React application for exploring live events, registering for them, and managing your
registrations. Event data comes from the **Ticketmaster Discovery API**.

Built for *Web Programming — Assignment 2*.

Repository: <https://github.com/zaneb-code/Event-management-system>

---

## Features

**Authentication (frontend simulation)**
- Register with name, email and password, with validation on every field
- Login and logout, with duplicate-email and wrong-password handling
- The session survives a page refresh, using `localStorage`
- All auth state is held in Redux Toolkit

**Event exploration**
- Browse events from the Ticketmaster Discovery API
- Search by keyword
- Filter by category, city, country and sort order, plus an "upcoming only" toggle
- Browse categories pulled live from the `/classifications` endpoint
- Paginated results, with loading skeletons and error messages

**Event details**
- Name, date, time, venue, full location, category and genre
- Event image, price range, ticket limit, promoter, seat map and line-up
- Link out to the official Ticketmaster page

**Registration**
- Logged-in users can register for any upcoming event
- Registering twice for the same event is blocked
- A toast message confirms each registration or cancellation
- Registrations belong to the account that made them

**My Events**
- Separate **Upcoming** and **Completed** tabs, split automatically by event date
- Sort by event date, when you registered, or event name
- Change the ticket count, or cancel a registration
- A confirmation code per registration
- Protected route — signed-out visitors are sent to the login page

**Interface**
- Responsive from 390 px phones up to desktop
- A four-colour scheme applied through CSS custom properties
- Reusable components, with loading, empty and error states throughout

---

## Tech stack

| Tool | Used for |
| --- | --- |
| React 18 | Building the UI out of components |
| Redux Toolkit | Shared state: auth, events, registrations |
| React Redux | The `useSelector` and `useDispatch` hooks |
| React Router 7 | Routing between pages, and protected routes |
| Vite | Dev server and production build |
| Plain CSS | All styling — no UI framework |

---

## Getting started

### 1. Prerequisites

- **Node.js 18 or newer** (check with `node -v`)
- npm, which comes with Node

### 2. Clone and install

```bash
git clone https://github.com/zaneb-code/Event-management-system.git
cd Event-management-system
npm install
```

### 3. Get a Ticketmaster API key

1. Sign up at <https://developer.ticketmaster.com/>
2. Open **My Apps** and create an app
3. Copy the **Consumer Key** — that is the API key

### 4. Add the key to a `.env` file

```bash
cp .env.example .env
```

Open `.env` and paste the key in:

```
VITE_TICKETMASTER_API_KEY=your_consumer_key_here
```

> `.env` is listed in `.gitignore` and must never be committed. Only `.env.example`,
> which holds a placeholder, belongs in the repository.

### 5. Run the app

```bash
npm run dev
```

Open <http://localhost:5173>. Until a key is set, the app shows a panel explaining how to
add one instead of failing silently.

### Other commands

```bash
npm run build     # production build into dist/
npm run preview   # serve that build locally
```

---

## Project structure

```
event-management-system/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── ticketmaster.js        Every Ticketmaster request, plus response flattening
│   ├── components/                Reusable pieces used by more than one page
│   │   ├── ApiKeyNotice.jsx
│   │   ├── ErrorMessage.jsx       also exports EmptyState
│   │   ├── EventCard.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── Footer.jsx
│   │   ├── Loader.jsx             also exports CardSkeleton and SkeletonGrid
│   │   ├── Navbar.jsx
│   │   ├── Pagination.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PublicOnlyRoute.jsx
│   │   ├── RegisterButton.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── SearchBar.jsx
│   │   └── Toast.jsx
│   ├── pages/                     One component per route
│   │   ├── Categories.jsx
│   │   ├── EventDetails.jsx
│   │   ├── Events.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── MyEvents.jsx
│   │   ├── NotFound.jsx
│   │   └── Register.jsx
│   ├── store/
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── eventsSlice.js
│   │   │   └── registrationsSlice.js
│   │   └── store.js               configureStore
│   ├── utils/
│   │   ├── format.js              Date and price formatting, form validation
│   │   └── localStorage.js        A safe wrapper around localStorage
│   ├── App.jsx                    All the routes
│   ├── index.css                  The whole stylesheet
│   └── main.jsx                   Entry point: Provider and BrowserRouter
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Routes

| Path | Page | Who can see it |
| --- | --- | --- |
| `/` | Home | Anyone |
| `/events` | Event list, search and filters | Anyone |
| `/events/:eventId` | Event details | Anyone |
| `/categories` | Browse by category | Anyone |
| `/login` | Login | Logged-out only |
| `/register` | Create account | Logged-out only |
| `/my-events` | My registrations | **Logged-in only** |
| `*` | 404 page | Anyone |

---

## Redux structure

```
store
├── auth
│   ├── user              { id, name, email } or null
│   ├── isAuthenticated   boolean
│   ├── error             login or register error message
│   └── successMessage    e.g. "Account created successfully"
│
├── events
│   ├── list / listStatus / listError / page    the main event list
│   ├── filters           { keyword, city, countryCode, classificationName, sort, upcomingOnly }
│   ├── upcoming          the short list shown on the home page
│   ├── selectedEvent     the event open on the details page
│   └── categories        from the /classifications endpoint
│
└── registrations
    ├── byUser            { [userId]: [ registration, ... ] }
    ├── sortBy            how the My Events lists are ordered
    └── feedback          the toast message after registering or cancelling
```

**Redux Toolkit features used**

- `configureStore` — in `src/store/store.js`
- `createSlice` — all three slices
- `createAsyncThunk` — `fetchEvents`, `fetchUpcomingEvents`, `fetchEventDetails`, `fetchCategories`
- `extraReducers` — handling pending, fulfilled and rejected for each thunk
- Selectors — for example `selectUpcomingRegistrations` and `selectIsRegisteredFor`
- `useSelector` and `useDispatch` — throughout the components and pages

---

## Ticketmaster API usage

| Endpoint | Used for |
| --- | --- |
| `GET /discovery/v2/events.json` | Event list, search, filters, pagination |
| `GET /discovery/v2/events/{id}.json` | The event details page |
| `GET /discovery/v2/classifications.json` | The category list |

Query parameters used: `apikey`, `keyword`, `city`, `countryCode`, `classificationName`,
`startDateTime`, `sort`, `page`, `size`.

Two of the API's limits are handled in code:

- **Rate limit** (2 requests per second): the filter inputs are debounced by 450 ms in
  `src/pages/Events.jsx`, and the search box only fires on submit. Without this, typing a
  city name would send one request per letter.
- **Page depth** (`size × page` must stay under 1000): `src/components/Pagination.jsx`
  caps the page count, so the user can never click into a request the API would reject.

---

## Design decisions

The assignment leaves these open, so here is the reasoning behind the main ones:

- **Three slices, split by what the data is** — who is logged in, what came back from the
  API, and what the user signed up for. Each changes for different reasons.
- **Form inputs use `useState`, not Redux.** Text being typed concerns one component. Only
  the result of the form — who is logged in — belongs in shared state.
- **Registrations store a copy of the event, not just its ID.** My Events then renders
  instantly instead of making one API request per saved event, which would hit the rate
  limit straight away. The trade-off is that a saved copy can go stale.
- **Duplicate-registration is blocked in the reducer, not the button**, so the rule holds
  no matter which component dispatches the action.
- **The sort choice lives in Redux but is not saved to localStorage.** It should survive
  moving between pages, but it is only a view preference, so resetting on a full refresh is
  acceptable — unlike the session and the registrations, which are persisted.
- **The home page does not filter by country.** The country filter already exists on the
  Events page, and defaulting the home page to one country makes it wrong for everyone else.
- **Colours come from CSS custom properties** defined once at the top of `index.css`, so
  the whole site can be re-themed from four values.

---

## Notes on authentication

This is a **frontend simulation**, which is what the assignment asks for. There is no
backend:

- Accounts are kept in `localStorage` under `ems_users`
- The active session is under `ems_current_user`
- Passwords are encoded with `btoa()` only so they are not plainly readable in devtools

This is **not secure**. A real application would hash passwords on a server with something
like bcrypt and manage sessions with signed tokens.

---

## License

Created for educational purposes as a university assignment.