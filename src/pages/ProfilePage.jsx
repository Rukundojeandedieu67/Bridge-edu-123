import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useOpportunityApplications } from '../hooks/useOpportunityApplications.js'
import { useMentorship } from '../hooks/useMentorship.js'

function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const { applications, isLoading: isLoadingApplications } = useOpportunityApplications()
  const { mentorshipRequests } = useMentorship()

  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({})
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    setFormState({
      full_name: user?.full_name || user?.name || '',
      district: user?.district || '',
      sector: user?.sector || '',
      education_level: user?.education_level || '',
    })
  }, [user])

  const matchedConversations = useMemo(() => {
    if (!Array.isArray(mentorshipRequests)) return []

    const matched = mentorshipRequests.filter((r) => r.status === 'matched')
    return matched.filter((r) => {
      const mentorId = r?.mentor?.id ?? r?.mentor_id
      const studentId = r?.student?.id ?? r?.student_id
      return Number(mentorId) === Number(user?.id) || Number(studentId) === Number(user?.id)
    })
  }, [mentorshipRequests, user?.id])

  // messages stored in localStorage under key 'bridgeedu-messages'
  const [messagesState, setMessagesState] = useState({})

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('bridgeedu-messages')
      setMessagesState(raw ? JSON.parse(raw) : {})
    } catch {
      setMessagesState({})
    }
  }, [])

  const persistMessages = (next) => {
    setMessagesState(next)
    try {
      window.localStorage.setItem('bridgeedu-messages', JSON.stringify(next))
    } catch {}
  }

  const conversationId = (mentorId, studentId) => {
    const a = String(mentorId)
    const b = String(studentId)
    return a < b ? `${a}_${b}` : `${b}_${a}`
  }

  const sendMessage = (convId, text) => {
    if (!text || !convId) return
    const now = new Date().toISOString()
    const next = { ...(messagesState || {}) }
    next[convId] = next[convId] ?? []
    next[convId].push({ senderId: user?.id, text, created_at: now })
    persistMessages(next)
  }

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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Conversations</h2>
              <p className="mt-1 text-sm text-slate-600">Chat with your matched mentor or mentees. Messages are stored locally for now.</p>
            </div>
          </div>

          {matchedConversations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
              No matched mentorships yet. Approve or claim a mentorship to enable conversations.
            </div>
          ) : (
            <div className="space-y-4">
              {matchedConversations.map((r) => {
                const mentorId = r?.mentor?.id ?? r?.mentor_id
                const studentId = r?.student?.id ?? r?.student_id
                const other = Number(mentorId) === Number(user?.id) ? r.student : r.mentor
                const convId = conversationId(mentorId, studentId)
                return (
                  <article key={r.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">Conversation with {other?.full_name || other?.name || 'User'}</p>
                        <p className="text-sm text-slate-600">Topic: {r.topic_of_interest}</p>
                      </div>
                    </div>

                    <div className="mb-3 max-h-48 overflow-auto rounded-lg border border-slate-200 bg-white p-3">
                      {(messagesState[convId] || []).map((m, idx) => (
                        <div key={idx} className={`mb-2 flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.senderId === user?.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                            {m.text}
                            <div className="mt-1 text-xs text-slate-300">{new Date(m.created_at).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <MessageInput onSend={(text) => sendMessage(convId, text)} />
                  </article>
                )
              })}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Edit profile</h2>
              <p className="mt-1 text-sm text-slate-600">You can update your profile details. Email cannot be changed here.</p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsEditing((s) => !s)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {isEditing ? 'Cancel' : 'Edit profile'}
              </button>
            </div>
          </div>

          {isEditing ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setSaveError('')
                try {
                  const updated = await updateProfile(formState)
                  setFormState({
                    full_name: updated?.full_name || '',
                    district: updated?.district || '',
                    sector: updated?.sector || '',
                    education_level: updated?.education_level || '',
                  })
                  setIsEditing(false)
                } catch (err) {
                  setSaveError(err?.response?.data?.message || 'Unable to save profile. Please try again.')
                }
              }}
              className="space-y-4"
            >
              {saveError ? <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</div> : null}

              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={user?.email || ''} readOnly className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700" />
                <p className="mt-1 text-xs text-slate-500">Email changes must be requested via support.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Full name</label>
                <input
                  value={formState.full_name ?? ''}
                  onChange={(e) => setFormState((s) => ({ ...s, full_name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">District</label>
                  <input value={formState.district ?? ''} onChange={(e) => setFormState((s) => ({ ...s, district: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Sector</label>
                  <input value={formState.sector ?? ''} onChange={(e) => setFormState((s) => ({ ...s, sector: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Education level</label>
                <input value={formState.education_level ?? ''} onChange={(e) => setFormState((s) => ({ ...s, education_level: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>

              <div className="flex items-center gap-3">
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Save changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          ) : null}
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

function MessageInput({ onSend }) {
  const [text, setText] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  return (
    <form onSubmit={handleSend} className="mt-2 flex gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <button type="submit" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">Send</button>
    </form>
  )
}
