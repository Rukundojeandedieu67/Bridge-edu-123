import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useUsers } from '../hooks/useUsers.js'
import { useMentorship } from '../hooks/useMentorship.js'
import { useOpportunities } from '../hooks/useOpportunities.js'
import { usePathways } from '../hooks/usePathways.js'

const emptyUserForm = {
  full_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role: 'student',
  district: '',
  sector: '',
  education_level: '',
}

function AdminPage() {
  const { user } = useAuth()
  const [selectedMentor, setSelectedMentor] = useState({})
  const [updatingRequestId, setUpdatingRequestId] = useState(null)
  const [adminError, setAdminError] = useState('')
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [editingUserId, setEditingUserId] = useState(null)
  const [userFormError, setUserFormError] = useState('')
  const [userFormSuccess, setUserFormSuccess] = useState('')

  const {
    users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: usersError,
    createUser,
    updateUser,
    deleteUser,
    isCreatingUser,
    isUpdatingUser,
    isDeletingUser,
  } = useUsers()
  const {
    mentors,
    mentorshipRequests,
    isLoadingRequests,
    isErrorRequests,
    requestsError,
    updateMentorshipRequest,
    isUpdatingRequest,
  } = useMentorship()
  const { opportunities, isLoading: isLoadingOpportunities } = useOpportunities({ page: 1 })
  const { pathways, isLoading: isLoadingPathways } = usePathways()

  const activeUsers = useMemo(() => users ?? [], [users])
  const totalOpportunities = opportunities?.meta?.total ?? opportunities?.data?.length ?? 0
  const totalPathways = pathways?.data?.length ?? 0
  const totalRequests = mentorshipRequests?.length ?? 0

  const mentorOptions = useMemo(() => mentors ?? [], [mentors])
  const assignedMentorId = (request) => request?.mentor?.id ?? request?.mentor_id
  const selectedMentorId = (request) => selectedMentor[request.id] ?? assignedMentorId(request)

  const handleSelectMentor = (requestId, mentorId) => {
    setSelectedMentor((prev) => ({ ...prev, [requestId]: mentorId }))
  }

  const handleApproveRequest = async (request) => {
    const mentorId = selectedMentorId(request)
    if (!mentorId) {
      setAdminError('Please select a mentor before approving.')
      return
    }

    setAdminError('')
    setUpdatingRequestId(request.id)

    try {
      await updateMentorshipRequest(request.id, { status: 'matched', mentor_id: mentorId })
    } catch (error) {
      setAdminError(error?.response?.data?.message || 'Unable to approve this mentorship request.')
    } finally {
      setUpdatingRequestId(null)
    }
  }

  const handleCompleteRequest = async (request) => {
    setAdminError('')
    setUpdatingRequestId(request.id)

    try {
      await updateMentorshipRequest(request.id, { status: 'completed' })
    } catch (error) {
      setAdminError(error?.response?.data?.message || 'Unable to complete this mentorship request.')
    } finally {
      setUpdatingRequestId(null)
    }
  }

  const resetUserForm = () => {
    setUserForm(emptyUserForm)
    setEditingUserId(null)
    setUserFormError('')
    setUserFormSuccess('')
  }

  const handleUserSubmit = async (event) => {
    event.preventDefault()
    setUserFormError('')
    setUserFormSuccess('')

    if (!userForm.full_name || !userForm.email || !userForm.password || !userForm.password_confirmation) {
      setUserFormError('Please fill in the name, email, password, and password confirmation fields.')
      return
    }

    if (userForm.password !== userForm.password_confirmation) {
      setUserFormError('Passwords do not match.')
      return
    }

    try {
      const payload = {
        full_name: userForm.full_name,
        email: userForm.email,
        password: userForm.password,
        password_confirmation: userForm.password_confirmation,
        role: userForm.role,
        district: userForm.district || undefined,
        sector: userForm.sector || undefined,
        education_level: userForm.education_level || undefined,
      }

      if (editingUserId) {
        await updateUser(editingUserId, payload)
        setUserFormSuccess('User updated successfully.')
      } else {
        await createUser(payload)
        setUserFormSuccess('User created successfully.')
      }

      resetUserForm()
    } catch (error) {
      setUserFormError(error?.response?.data?.message || 'Unable to save the user right now.')
    }
  }

  const handleEditUser = (userItem) => {
    setEditingUserId(userItem.id)
    setUserForm({
      full_name: userItem.full_name || userItem.name || '',
      email: userItem.email || '',
      password: '',
      password_confirmation: '',
      role: userItem.role || 'student',
      district: userItem.district || '',
      sector: userItem.sector || '',
      education_level: userItem.education_level || '',
    })
    setUserFormError('')
    setUserFormSuccess('')
  }

  const handleDeleteUser = async (userItem) => {
    if (!window.confirm(`Delete ${userItem.full_name || userItem.email}?`)) {
      return
    }

    try {
      await deleteUser(userItem.id)
      setUserFormSuccess('User deleted successfully.')
    } catch (error) {
      setUserFormError(error?.response?.data?.message || 'Unable to delete this user.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">BridgeEdu Rwanda</p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Admin dashboard</h1>
              <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">Coordinate opportunities, pathways, mentorship, and user access from one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/opportunities" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                Manage opportunities
              </Link>
              <Link to="/pathways" className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                Manage pathways
              </Link>
              <Link to="/mentorship" className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                Manage mentorship
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Users</p>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Live</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingUsers ? '…' : activeUsers.length}</p>
            <p className="mt-2 text-sm text-slate-600">Registered accounts and roles</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Opportunities</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingOpportunities ? '…' : totalOpportunities}</p>
            <p className="mt-2 text-sm text-slate-600">Programs and openings</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pathways</p>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Guided</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingPathways ? '…' : totalPathways}</p>
            <p className="mt-2 text-sm text-slate-600">Learning tracks and steps</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Requests</p>
              <span className="rounded-full bg-fuchsia-50 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">Pending</span>
            </div>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingRequests ? '…' : totalRequests}</p>
            <p className="mt-2 text-sm text-slate-600">Mentorship matches in queue</p>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">User management</h2>
              <p className="mt-1 text-sm text-slate-600">Create, edit, or remove users from the platform.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/opportunities" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                View opportunities
              </Link>
              <Link to="/pathways" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                View pathways
              </Link>
            </div>
          </div>

          {user?.role === 'super_admin' ? (
            <form onSubmit={handleUserSubmit} className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{editingUserId ? 'Edit user' : 'Create user'}</h3>
                  <p className="text-sm text-slate-600">Super-admins can manage access for the platform.</p>
                </div>
                {editingUserId ? (
                  <button type="button" onClick={resetUserForm} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                    Cancel
                  </button>
                ) : null}
              </div>

              {userFormError ? <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{userFormError}</div> : null}
              {userFormSuccess ? <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{userFormSuccess}</div> : null}

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full name</label>
                  <input value={userForm.full_name} onChange={(event) => setUserForm((current) => ({ ...current, full_name: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input type="email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input type="password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm password</label>
                  <input type="password" value={userForm.password_confirmation} onChange={(event) => setUserForm((current) => ({ ...current, password_confirmation: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Role</label>
                  <select value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option value="student">Student</option>
                    <option value="mentor">Mentor</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">District</label>
                  <input value={userForm.district} onChange={(event) => setUserForm((current) => ({ ...current, district: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Sector</label>
                  <input value={userForm.sector} onChange={(event) => setUserForm((current) => ({ ...current, sector: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Education level</label>
                  <input value={userForm.education_level} onChange={(event) => setUserForm((current) => ({ ...current, education_level: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <button type="submit" disabled={isCreatingUser || isUpdatingUser} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
                {editingUserId ? 'Save changes' : 'Create user'}
              </button>
            </form>
          ) : null}

          {isErrorUsers ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {usersError?.response?.data?.message || 'Unable to load users.'}
            </div>
          ) : activeUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No users available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Location</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {activeUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{userItem.full_name || userItem.name}</td>
                      <td className="px-4 py-3 text-slate-700">{userItem.email}</td>
                      <td className="px-4 py-3 text-slate-700">{userItem.role}</td>
                      <td className="px-4 py-3 text-slate-700">{userItem.district ?? userItem.sector ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => handleEditUser(userItem)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteUser(userItem)} disabled={isDeletingUser} className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Mentorship requests</h2>
              <p className="mt-1 text-sm text-slate-600">Review the current mentorship pipeline.</p>
            </div>
            <Link
              to="/mentorship"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open mentorship page
            </Link>
          </div>

          {isLoadingRequests ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : isErrorRequests ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {requestsError?.response?.data?.message || 'Unable to load mentorship requests.'}
            </div>
          ) : mentorshipRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No mentorship requests yet.
            </div>
          ) : (
            <>
              {adminError ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {adminError}
                </div>
              ) : null}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Mentor</th>
                      <th className="px-4 py-3 font-semibold">Topic</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {mentorshipRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-700">{request.student?.full_name || 'Student'}</td>
                        <td className="px-4 py-3 text-slate-700">{request.mentor?.full_name || request.mentor_name || 'Unassigned'}</td>
                        <td className="px-4 py-3 text-slate-700">{request.topic_of_interest}</td>
                        <td className="px-4 py-3 text-slate-700">{request.status}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {request.status === 'pending' ? (
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <select
                                value={selectedMentorId(request) ?? ''}
                                onChange={(event) => handleSelectMentor(request.id, event.target.value)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                              >
                                <option value="">Select mentor</option>
                                {mentorOptions.map((mentor) => (
                                  <option key={mentor.id} value={mentor.id}>
                                    {mentor.full_name}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => handleApproveRequest(request)}
                                disabled={isUpdatingRequest && updatingRequestId === request.id}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                              >
                                Approve
                              </button>
                            </div>
                          ) : request.status === 'matched' ? (
                            <button
                              type="button"
                              onClick={() => handleCompleteRequest(request)}
                              disabled={isUpdatingRequest && updatingRequestId === request.id}
                              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              Complete
                            </button>
                          ) : (
                            <span className="text-sm text-slate-500">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Mentorship activity log</h3>
                  <p className="mt-1 text-sm text-slate-600">Track request status changes and latest updates across the platform.</p>
                </div>
                <div className="space-y-3">
                  {mentorshipRequests.map((request) => (
                    <div key={`log-${request.id}`} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{request.student?.full_name || 'Student'}</p>
                          <p className="text-sm text-slate-600">{request.topic_of_interest}</p>
                        </div>
                        <div className="flex flex-col text-sm text-slate-500 sm:text-right">
                          <span>Status: {request.status}</span>
                          <span>Updated: {new Date(request.updated_at || request.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminPage
