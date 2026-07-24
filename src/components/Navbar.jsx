import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import logo from '../assets/bridge-edu.png'

const navItems = [
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/pathways', label: 'Pathways' },
  { to: '/mentorship', label: 'Mentorship' },
]

const roleBadgeStyles = {
  student: 'bg-sky-100 text-sky-800',
  mentor: 'bg-emerald-100 text-emerald-800',
  admin: 'bg-rose-100 text-rose-800',
  super_admin: 'bg-fuchsia-100 text-fuchsia-800',
}

const roleLabels = {
  student: 'Student',
  mentor: 'Mentor',
  admin: 'Admin',
  super_admin: 'Super Admin',
}

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const role = user?.role ?? 'student'
  const badgeClass = roleBadgeStyles[role] ?? roleBadgeStyles.student
  const roleLabel = roleLabels[role] ?? roleLabels.student

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <NavLink to="/opportunities" className="flex items-center gap-3">
            <img src={logo} alt="BridgeEdu" className="h-8 w-auto" />
            <span className="text-lg font-semibold tracking-tight text-slate-900">BridgeEdu Rwanda</span>
          </NavLink>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100'
              }`
            }
          >
            Profile
          </NavLink>
          {(role === 'admin' || role === 'super_admin') ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              Admin
            </NavLink>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'User'}</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
              {roleLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <span aria-hidden="true">⇦</span>
            Logout
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-100 md:hidden"
          aria-label="Toggle navigation"
        >
          <span className="text-xl" aria-hidden="true">
            {isMenuOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-slate-200 bg-white/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">{user?.full_name || 'User'}</p>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
                {role}
              </span>

              <NavLink
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `mt-3 block rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                Profile
              </NavLink>

              {(role === 'admin' || role === 'super_admin') ? (
                <NavLink
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `mt-2 block rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  Admin
                </NavLink>
              ) : null}

              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <span aria-hidden="true">⇦</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
