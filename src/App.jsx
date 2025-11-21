import React from "react"
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import PlansPage from "./pages/PlansPage"
import ApplicationsPage from "./pages/ApplicationsPage"
import ContractsPage from "./pages/ContractsPage"
import NotFoundPage from "./pages/NotFoundPage"
import AdminLayout from "./components/layout/AdminLayout"
import { useAuth } from "./context/AuthContext"

/**
 * ProtectedRoute that:
 * - waits for auth to bootstrap from localStorage (prevents jump-to-login flicker)
 * - redirects to /login and remembers where user wanted to go
 */
function ProtectedRoute() {
  const { isAuthenticated, bootstrapped } = useAuth()
  const location = useLocation()

  if (!bootstrapped) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected area */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
