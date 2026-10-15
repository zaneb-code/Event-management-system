# Eventia — Event Management System

A React + Redux Toolkit application for exploring live events, registering for them, and
managing your registrations. Event data comes from the **Ticketmaster Discovery API**.

Built for *Web Programming — Assignment 2*.

---

## Features

**Authentication (frontend simulation)**
- Register with name, email and password, with full form validation
- Login / logout, with duplicate-email and wrong-password handling
- Session persists across page refreshes using `localStorage`
- Auth state managed entirely in Redux Toolkit

**Event exploration**
- Browse events from the Ticketmaster Discovery API
- Free-text search by keyword
- Filter by category, city, country and sort order
- "Upcoming only" toggle
- Browse event categories pulled live from the `/classifications` endpoint
- Paginated results with loading skeletons and error handling

**Event details**
- Name, date, time, venue, full location, category and genre
- Event image, price range, ticket limit, promoter, seat map and line-up
- Links out to the official Ticketmaster page

**Registration**
- Logged-in users can register for any upcoming event
- Duplicate registration is blocked
- Toast feedback after registering or cancelling
- Registrations are tied to the logged-in user account

**My Events**
- Separate **Upcoming** and **Completed** tabs
- Adjust ticket count, cancel a registration
- Confirmation code per registration
- Protected route — redirects to login when signed out

**UI**
- Responsive from 390 px phones up to desktop
- Dark theme with a consistent design system (CSS custom properties)
- Reusable components, loading skeletons, empty states and error states
- Respects `prefers-reduced-motion`

---

## Tech stack

| Tool | Purpose |
| --- | --- |
| React 18 | UI components |
| Redux Toolkit | Global state (auth, events, registrations) |
| React Redux | `useSelector` / `useDispatch` bindings |
| React Router 7 | Client-side routing and protected routes |
| Vite | Dev server and production build |
| Plain CSS | Styling — no UI framework |

---

## Getting started

### 1. Prerequisites

- **Node.js 18 or newer** (check with `node -v`)
- npm (ships with Node)

### 2. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/event-management-system.git
cd event-management-system
npm install
```

### 3. Get a Ticketmaster API key

1. Sign up at <https://developer.ticketmaster.com/>
2. Open **My Apps** and create an app
3. Copy the **Consumer Key** — that is your API key

### 4. Add the key to a `.env` file

```bash
cp .env.example .env
```

Then open `.env` and paste your key:

```
VITE_TICKETMASTER_API_KEY=your_consumer_key_here
```

> **Important:** `.env` is listed in `.gitignore` and must never be committed.
> Only `.env.example` (with no real key in it) belongs in the repository.

### 5. Run the app

```bash
npm run dev
```

Open <http://localhost:5173>.

### Other commands

```bash
npm run build     # production build into dist/
npm run preview   # preview the production build locally
```

---

## Project structure

```
event-management-system/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   └── ticketmaster.js        All Ticketmaster calls + response normalising
│   ├── components/                Reusable UI pieces
│   │   ├── ApiKeyNotice.jsx
│   │   ├── ErrorMessage.jsx       (also exports EmptyState)
│   │   ├── EventCard.jsx
│   │   ├── FilterPanel.jsx
│   │   ├── Footer.jsx
│   │   ├── Loader.jsx             (also exports CardSkeleton, SkeletonGrid)
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
│   │   ├── format.js              Date/price formatting + form validation
│   │   └── localStorage.js        Safe localStorage wrapper
│   ├── App.jsx                    Route definitions
│   ├── index.css                  Entire stylesheet
│   └── main.jsx                   Entry point, Provider + BrowserRouter
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/events` | Events list, search and filters | Public |
| `/events/:eventId` | Event details | Public |
| `/categories` | Browse categories | Public |
| `/login` | Login | Logged-out only |
| `/register` | Create account | Logged-out only |
| `/my-events` | My registrations | **Protected** |
| `*` | 404 | Public |

---

## Redux structure

```
store
├── auth
│   ├── user              { id, name, email } or null
│   ├── isAuthenticated   boolean
│   ├── error             login/register error message
│   └── successMessage    e.g. "Account created successfully"
│
├── events
│   ├── list / listStatus / listError / page    main events list
│   ├── filters           { keyword, city, countryCode, classificationName, sort, upcomingOnly }
│   ├── upcoming          short list for the home page
│   ├── selectedEvent     the event on the details page
│   └── categories        from /classifications
│
└── registrations
    ├── byUser            { [userId]: [ registration, ... ] }
    └── feedback          toast message after register/cancel
```

**Redux Toolkit features used**

- `configureStore` — `src/store/store.js`
- `createSlice` — all three slices
- `createAsyncThunk` — `fetchEvents`, `fetchUpcomingEvents`, `fetchEventDetails`, `fetchCategories`
- `extraReducers` — pending / fulfilled / rejected handling for every thunk
- `useSelector` / `useDispatch` — throughout the components and pages
- Selectors — e.g. `selectUpcomingRegistrations`, `selectIsRegisteredFor`

---

## Ticketmaster API usage

| Endpoint | Used for |
| --- | --- |
| `GET /discovery/v2/events.json` | Event list, search, filters, pagination |
| `GET /discovery/v2/events/{id}.json` | Event details page |
| `GET /discovery/v2/classifications.json` | Category list |

Query parameters used: `apikey`, `keyword`, `city`, `countryCode`, `classificationName`,
`startDateTime`, `sort`, `page`, `size`.

Two API limits are handled in code:

- **Rate limit** (2 requests/second): the filter inputs are debounced by 450 ms in
  `src/pages/Events.jsx`, and the search box only queries on submit.
- **Page depth** (`size × page < 1000`): `src/components/Pagination.jsx` caps the number
  of selectable pages so the API never receives an out-of-range request.

---

## Notes on authentication

This is a **frontend authentication simulation**, as the assignment specifies. There is no
backend server:

- Accounts are stored in `localStorage` under `ems_users`
- The active session is stored under `ems_current_user`
- Passwords are lightly encoded with `btoa()` so they are not plainly visible

This is **not** secure and would never be acceptable in a real application, where passwords
must be hashed server-side with something like bcrypt and sessions handled with secure
tokens.

---

## License

Created for educational purposes as a university assignment.
