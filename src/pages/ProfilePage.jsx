import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useOpportunityApplications } from '../hooks/useOpportunityApplications.js'

function ProfilePage() {
  const { user } = useAuth()
  const { applications, isLoading: isLoadingApplications } = useOpportunityApplications()

  const profileFields = [
    { label: 'Full name', value: user?.full_name || user?.name || 'N/A' },
    { label: 'Email', value: user?.email || 'N/A' },
    { label: 'Role', value: user?.role ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1) : 'N/A' },
    { label: 'District', value: user?.district || 'N/A' },
    { label: 'Sector', value: user?.sector || 'N/A' },
    { label: 'Education level', value: user?.education_level || 'N/A' },
  ]

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Your profile</h1>
            <p className="mt-2 text-sm text-slate-600">Review your account details and access the student, mentor, or admin experience.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {profileFields.map((field) => (
              <article key={field.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{field.label}</p>
                <p className="mt-2 text-sm text-slate-900">{field.value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick access</h2>
              <p className="mt-1 text-sm text-slate-600">Go directly to the tools you use most.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Link
                to="/opportunities"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Opportunities
              </Link>
              <Link
                to="/pathways"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Pathways
              </Link>
              <Link
                to="/mentorship"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Mentorship
              </Link>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">My applications</h2>
              <p className="mt-1 text-sm text-slate-600">Track the opportunities you’ve applied to and see their status.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {applications.length} submissions
            </div>
          </div>

          {isLoadingApplications ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              You have not applied to any opportunities yet.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((application) => (
                <article key={application.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{application.opportunity?.title || 'Opportunity'}</p>
                      <p className="mt-1 text-sm text-slate-600">{application.opportunity?.provider_name || 'BridgeEdu'}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                      {application.status || 'pending'}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default ProfilePage
