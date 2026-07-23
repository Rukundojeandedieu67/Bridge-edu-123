import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useMentorship } from '../hooks/useMentorship.js'

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  matched: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-200 text-slate-700',
  default: 'bg-slate-100 text-slate-700',
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusLabel(status) {
  return status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : 'Pending'
}

function resolveMentorName(request) {
  if (!request) {
    return 'Unassigned'
  }

  if (request.mentor?.full_name) {
    return request.mentor.full_name
  }

  if (request.mentor_name) {
    return request.mentor_name
  }

  if (request.mentor?.name) {
    return request.mentor.name
  }

  if (request.mentor_id) {
    return 'Assigned mentor'
  }

  return 'Unassigned'
}

function isAssignedToUser(request, userId) {
  const mentorId = request?.mentor?.id ?? request?.mentor_id

  if (mentorId == null || userId == null) {
    return false
  }

  return Number(mentorId) === Number(userId)
}

function MentorshipPage() {
  const { user } = useAuth()
  const [topicOfInterest, setTopicOfInterest] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [updatingRequestId, setUpdatingRequestId] = useState(null)

  const role = (user?.role ?? 'student').toLowerCase()
  const isStudent = role === 'student'
  const isMentor = role === 'mentor'
  const isAdmin = role === 'admin'

  const {
    mentors,
    mentorshipRequests,
    isLoadingMentors,
    isLoadingRequests,
    isErrorRequests,
    requestsError,
    createMentorshipRequest,
    updateMentorshipRequest,
    isCreatingRequest,
    isUpdatingRequest,
  } = useMentorship()

  const openRequests = useMemo(
    () => mentorshipRequests.filter((request) => request.status === 'pending' && !isAssignedToUser(request, user?.id)),
    [mentorshipRequests, user?.id],
  )

  const myMentees = useMemo(
    () => mentorshipRequests.filter((request) => isAssignedToUser(request, user?.id)),
    [mentorshipRequests, user?.id],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!topicOfInterest.trim()) {
      setSubmitError('Please enter a topic of interest.')
      return
    }

    setSubmitError('')

    try {
      await createMentorshipRequest({ topic_of_interest: topicOfInterest.trim() })
      setTopicOfInterest('')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to submit your mentorship request right now.')
    }
  }

  const handleClaimRequest = async (requestId) => {
    setUpdatingRequestId(requestId)

    try {
      await updateMentorshipRequest(requestId, { status: 'matched' })
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to claim this request right now.')
    } finally {
      setUpdatingRequestId(null)
    }
  }

  const handleCompleteRequest = async (requestId) => {
    setUpdatingRequestId(requestId)

    try {
      await updateMentorshipRequest(requestId, { status: 'completed' })
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to mark this mentorship as completed.')
    } finally {
      setUpdatingRequestId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-900">Mentorship</h1>
              <p className="mt-2 text-sm text-slate-600">
                Connect students with mentors, manage requests, and track progress in one place.
              </p>
            </div>

            <div className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
              {isStudent ? 'Student view' : isMentor ? 'Mentor view' : isAdmin ? 'Admin view' : 'Mentorship'}
            </div>
          </div>
        </section>

        {isStudent ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Request a Mentor</h2>
                  <p className="mt-1 text-sm text-slate-600">Share the area you want support with and we’ll connect you.</p>
                </div>
              </div>

              {submitError ? (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-1 block">Topic of interest</span>
                  <textarea
                    value={topicOfInterest}
                    onChange={(event) => setTopicOfInterest(event.target.value)}
                    rows="4"
                    placeholder="I’d like help with career readiness, software engineering, and interview prep."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-blue-500"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isCreatingRequest}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
                >
                  {isCreatingRequest ? 'Submitting...' : 'Request a Mentor'}
                </button>
              </form>

              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Your requests</h3>
                  <span className="text-sm text-slate-500">Latest updates</span>
                </div>

                {isLoadingRequests ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-2 h-4 w-28 rounded bg-slate-200" />
                        <div className="h-4 w-full rounded bg-slate-100" />
                      </div>
                    ))}
                  </div>
                ) : isErrorRequests ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">
                    {requestsError?.response?.data?.message || 'Unable to load your mentorship requests.'}
                  </div>
                ) : mentorshipRequests.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                    No requests yet. Submit your first request to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mentorshipRequests.map((request) => (
                      <article key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{request.topic_of_interest}</p>
                            <p className="mt-1 text-sm text-slate-600">Assigned mentor: {resolveMentorName(request)}</p>
                          </div>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[request.status] ?? statusStyles.default}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                          <span>Created {formatDate(request.created_at)}</span>
                          <span>Updated {formatDate(request.updated_at)}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900">Mentors directory</h2>
                <p className="mt-1 text-sm text-slate-600">Browse available mentors who can support your goals.</p>
              </div>

              {isLoadingMentors ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 h-4 w-28 rounded bg-slate-200" />
                      <div className="h-4 w-36 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : mentors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  No mentors available right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {mentors.map((mentor) => (
                    <article key={mentor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{mentor.full_name}</p>
                      <p className="mt-1 text-sm text-slate-600">{mentor.email}</p>
                    </article>
                  ))}
                </div>
              )}
            </aside>
          </div>
        ) : null}

        {isMentor ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Open requests</h2>
                  <p className="mt-1 text-sm text-slate-600">Requests awaiting a mentor claim.</p>
                </div>
              </div>

              {isLoadingRequests ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 h-4 w-28 rounded bg-slate-200" />
                      <div className="h-4 w-full rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : openRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  No open requests right now.
                </div>
              ) : (
                <div className="space-y-3">
                  {openRequests.map((request) => (
                    <article key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{request.student?.full_name || 'Student'}</p>
                          <p className="mt-1 text-sm text-slate-600">{request.topic_of_interest}</p>
                          <p className="mt-2 text-sm text-slate-500">Requested {formatDate(request.created_at)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleClaimRequest(request.id)}
                          disabled={isUpdatingRequest && updatingRequestId !== request.id}
                          className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:w-auto"
                        >
                          Claim
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900">My mentees</h2>
                <p className="mt-1 text-sm text-slate-600">Track the learners you are actively supporting.</p>
              </div>

              {isLoadingRequests ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 h-4 w-28 rounded bg-slate-200" />
                      <div className="h-4 w-full rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : myMentees.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                  No mentees yet. Claim an open request to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {myMentees.map((request) => (
                    <article key={request.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{request.student?.full_name || 'Student'}</p>
                          <p className="mt-1 text-sm text-slate-600">{request.topic_of_interest}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span>Status {getStatusLabel(request.status)}</span>
                            <span>Updated {formatDate(request.updated_at)}</span>
                          </div>
                        </div>
                        {request.status === 'matched' ? (
                          <button
                            type="button"
                            onClick={() => handleCompleteRequest(request.id)}
                            disabled={isUpdatingRequest && updatingRequestId !== request.id}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                          >
                            Mark Completed
                          </button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}

        {isAdmin ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-slate-900">All mentorship requests</h2>
              <p className="mt-1 text-sm text-slate-600">Administrators can review the full mentorship pipeline.</p>
            </div>

            {isLoadingRequests ? (
              <div className="p-5 sm:p-6">
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-12 rounded-lg bg-slate-100" />
                  ))}
                </div>
              </div>
            ) : mentorshipRequests.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-600 sm:p-6">No requests yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Student</th>
                      <th className="px-4 py-3 font-semibold">Mentor</th>
                      <th className="px-4 py-3 font-semibold">Topic</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {mentorshipRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{request.student?.full_name || 'Student'}</td>
                        <td className="px-4 py-3 text-slate-700">{resolveMentorName(request)}</td>
                        <td className="px-4 py-3 text-slate-700">{request.topic_of_interest}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[request.status] ?? statusStyles.default}`}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(request.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default MentorshipPage
