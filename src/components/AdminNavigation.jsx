import { NavLink } from 'react-router-dom'

const adminLinks = [
  { to: '/admin', label: 'Overview' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/pathways', label: 'Pathways' },
  { to: '/mentorship', label: 'Mentorship' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/support', label: 'Support & ads' },
  { to: '/admin/ads', label: 'Advertisements' },
]

function AdminNavigation() {
  return (
    <nav aria-label="Administration" className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      {adminLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === '/admin'}
          className={({ isActive }) => `shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default AdminNavigation
