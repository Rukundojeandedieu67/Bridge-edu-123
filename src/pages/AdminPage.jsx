import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useUsers } from '../hooks/useUsers.js'
import { useMentorship } from '../hooks/useMentorship.js'
import { useOpportunities } from '../hooks/useOpportunities.js'
import { usePathways } from '../hooks/usePathways.js'

function AdminPage() {
  const { user } = useAuth()
  const { users, isLoading: isLoadingUsers, isError: isErrorUsers, error: usersError } = useUsers()
  const { mentorshipRequests, isLoadingRequests, isErrorRequests, requestsError } = useMentorship()
  const { opportunities, isLoading: isLoadingOpportunities } = useOpportunities({ page: 1 })
  const { pathways, isLoading: isLoadingPathways } = usePathways()

  const activeUsers = useMemo(() => users ?? [], [users])
  const totalOpportunities = opportunities?.meta?.total ?? opportunities?.data?.length ?? 0
  const totalPathways = pathways?.data?.length ?? 0
  const totalRequests = mentorshipRequests?.length ?? 0

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Admin dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">Manage opportunities, pathways, mentorship requests, and users.</p>
            </div>
            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Welcome, {user?.full_name || 'Admin'}</div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Users</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingUsers ? '…' : activeUsers.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Opportunities</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingOpportunities ? '…' : totalOpportunities}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pathways</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingPathways ? '…' : totalPathways}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Requests</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{isLoadingRequests ? '…' : totalRequests}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">User list</h2>
              <p className="mt-1 text-sm text-slate-600">Registered platform users and roles.</p>
            </div>
            <Link
              to="/opportunities"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Manage opportunities
            </Link>
          </div>

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {activeUsers.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{userItem.full_name || userItem.name}</td>
                      <td className="px-4 py-3 text-slate-700">{userItem.email}</td>
                      <td className="px-4 py-3 text-slate-700">{userItem.role}</td>
                      <td className="px-4 py-3 text-slate-700">{userItem.district ?? userItem.sector ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Student</th>
                    <th className="px-4 py-3 font-semibold">Mentor</th>
                    <th className="px-4 py-3 font-semibold">Topic</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {mentorshipRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-700">{request.student?.full_name || 'Student'}</td>
                      <td className="px-4 py-3 text-slate-700">{request.mentor?.full_name || request.mentor_name || 'Unassigned'}</td>
                      <td className="px-4 py-3 text-slate-700">{request.topic_of_interest}</td>
                      <td className="px-4 py-3 text-slate-700">{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default AdminPage
