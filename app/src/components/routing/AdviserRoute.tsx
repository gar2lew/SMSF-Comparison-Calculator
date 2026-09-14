import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdviserStore } from '@/stores/adviserStore'

export function AdviserRoute() {
  const adviser = useAdviserStore((state) => state.adviser)
  const location = useLocation()

  if (!adviser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
