import React from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import Button from '../ui/Button'

const navItems = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/plans', label: 'Gói trả góp' },
  { to: '/applications', label: 'Hồ sơ trả góp' },
  { to: '/contracts', label: 'Hợp đồng' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white/80 px-4 py-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 md:flex">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <span className="text-lg font-bold">TG</span>
          </div>
          <div>
            <div className="text-base font-semibold">Installment Admin</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Dashboard trả góp</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 text-base">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-md px-3 py-2 font-medium transition',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-700/20 dark:text-primary-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.fullName ?? 'Admin'}</span>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                {user?.role ?? 'ADMIN'}
              </span>
            </div>
            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-sm font-semibold">
              {navItems.find((n) => n.to === location.pathname)?.label ?? 'Dashboard'}
            </span>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? (
                <span className="text-lg" aria-label="Chuyển sang giao diện sáng">☀️</span>
              ) : (
                <span className="text-lg" aria-label="Chuyển sang giao diện tối">🌙</span>
              )}
            </button>
          </div>
        </header>

        {/* Content – FULL WIDTH */}
        <main className="flex-1 overflow-y-auto bg-slate-50/60 px-4 py-4 dark:bg-slate-950/60 md:px-6 md:py-6">
          <div className="w-full"> 
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
