import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/pathways', label: 'Pathways' },
  { to: '/mentorship', label: 'Mentorship' },
]

function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (to) => {
    if (to === '/opportunities' && location.pathname.startsWith('/opportunities')) {
      return true
    }

    if (to === '/pathways' && location.pathname.startsWith('/pathways')) {
      return true
    }

    if (to === '/mentorship' && location.pathname.startsWith('/mentorship')) {
      return true
    }

    return false
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <NavLink to="/opportunities" className="text-lg font-semibold tracking-tight text-slate-900">
              BridgeEdu Rwanda
            </NavLink>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive: isNavActive }) =>
                  `rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive(item.to) || isNavActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'User'}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{user?.role || 'student'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log out
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-700 shadow-sm md:hidden"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-slate-200 bg-white/95 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive: isNavActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive(item.to) || isNavActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-2 border-t border-slate-200 pt-3">
                <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'User'}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{user?.role || 'student'}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        {children ?? <Outlet />}
      </main>
    </div>
  )
}

export default AppLayout
