/**
 * The opposite of ProtectedRoute: keeps a signed-in user away from the
 * Login and Register pages by sending them to My Events instead.
 */

import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../store/slices/authSlice'

export default function PublicOnlyRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/my-events" replace />
  }

  return children
}
