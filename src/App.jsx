/**
 * ============================================================
 *  App — route definitions (requirement 7: React Router)
 * ============================================================
 *
 *   /                 Home          — hero + upcoming events
 *   /events           Events        — list, search, filters, pagination
 *   /events/:id       EventDetails  — full details for one event
 *   /categories       Categories    — browse by category
 *   /login            Login         — public only
 *   /register         Register      — public only
 *   /my-events        MyEvents      — PROTECTED, logged-in users only
 *   *                 NotFound      — anything else
 */

import { Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Toast from './components/Toast'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'

import Home from './pages/Home'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Categories from './pages/Categories'
import Login from './pages/Login'
import Register from './pages/Register'
import MyEvents from './pages/MyEvents'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <div className="app-shell">
      {/* Jumps back to the top whenever the route changes */}
      <ScrollToTop />

      <Navbar />

      {/* Toast messages for registration feedback */}
      <Toast />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetails />} />
          <Route path="/categories" element={<Categories />} />

          {/* A logged-in user has no reason to see these two */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Protected route — redirects to /login when not signed in */}
          <Route
            path="/my-events"
            element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}
