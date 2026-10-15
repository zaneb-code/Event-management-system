/**
 * ProtectedRoute (requirement: protected routes)
 *
 * Wrap any element that should only be reachable by a logged-in user:
 *
 *   <Route path="/my-events" element={
 *     <ProtectedRoute><MyEvents /></ProtectedRoute>
 *   } />
 *
 * If there is no user in Redux we send them to /login. We also pass the
 * page they *wanted* in router state, so Login can bounce them straight
 * back there after a successful sign-in.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../store/slices/authSlice'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
