import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navigationItems = [
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/pathways', label: 'Pathways' },
  { to: '/mentorship', label: 'Mentorship' },
]

function AppShell({ children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
            <p className="mt-1 text-sm text-slate-600">
              {user?.full_name || 'Signed in'} • {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member'}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>

      <div>{children}</div>
    </div>
  )
}

export default AppShell
