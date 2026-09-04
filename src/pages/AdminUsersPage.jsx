import { useState } from 'react'
import AdminNavigation from '../components/AdminNavigation.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useUsers } from '../hooks/useUsers.js'

const emptyForm = { full_name: '', email: '', password: '', password_confirmation: '', role: 'student' }

function AdminUsersPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const { users, isLoading, isError, error, createUser, updateUser, deleteUser, isCreatingUser, isUpdatingUser } = useUsers()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const reset = () => { setForm(emptyForm); setEditingId(null) }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback('')
    if (form.password !== form.password_confirmation) { setFeedback('Passwords do not match.'); return }
    try {
      const payload = { full_name: form.full_name, email: form.email, password: form.password, password_confirmation: form.password_confirmation, role: form.role }
      if (editingId) await updateUser(editingId, payload)
      else await createUser(payload)
      setFeedback(editingId ? 'User updated.' : 'User created.')
      reset()
    } catch (submitError) { setFeedback(submitError?.response?.data?.message || 'Unable to save user.') }
  }

  const editUser = (userItem) => {
    setForm({ full_name: userItem.full_name || userItem.name || '', email: userItem.email, password: '', password_confirmation: '', role: userItem.role || 'student' })
    setEditingId(userItem.id)
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminNavigation />
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Administration</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">User management</h1>
          <p className="mt-2 text-sm text-slate-600">Create, update, and remove student, mentor, and administrative accounts.</p>
          {feedback ? <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{feedback}</p> : null}
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
            <input required value={form.full_name} onChange={(event) => updateField('full_name', event.target.value)} placeholder="Full name" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="Email" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required={!editingId} type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Password" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required={!editingId} type="password" value={form.password_confirmation} onChange={(event) => updateField('password_confirmation', event.target.value)} placeholder="Confirm password" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <select value={form.role} onChange={(event) => updateField('role', event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              <option value="student">Student</option><option value="mentor">Mentor</option>
              {isSuperAdmin ? <><option value="admin">Admin</option><option value="super_admin">Super admin</option></> : null}
            </select>
            <div className="flex gap-2"><button type="submit" disabled={isCreatingUser || isUpdatingUser} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{editingId ? 'Save changes' : 'Create user'}</button>{editingId ? <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}</div>
          </form>
          {isError ? <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error?.response?.data?.message || 'Unable to load users.'}</p> : null}
          {!isLoading && !isError ? <div className="mt-6 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((userItem) => <tr key={userItem.id}><td className="px-3 py-3 font-medium text-slate-900">{userItem.full_name || userItem.name}</td><td className="px-3 py-3 text-slate-600">{userItem.email}</td><td className="px-3 py-3 capitalize text-slate-600">{userItem.role?.replace('_', ' ')}</td><td className="px-3 py-3"><div className="flex gap-2"><button type="button" onClick={() => editUser(userItem)} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700">Edit</button>{userItem.id !== user.id ? <button type="button" onClick={async () => { if (window.confirm(`Delete ${userItem.email}?`)) await deleteUser(userItem.id) }} className="rounded-lg border border-rose-300 px-3 py-1.5 font-semibold text-rose-700">Delete</button> : null}</div></td></tr>)}</tbody></table></div> : null}
        </section>
      </div>
    </main>
  )
}

export default AdminUsersPage
