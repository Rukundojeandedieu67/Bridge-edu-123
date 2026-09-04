import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOpportunity } from '../api/opportunities'
import { createApplication } from '../api/applications'

function OpportunityApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [coverLetter, setCoverLetter] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => getOpportunity(id),
  })
  const opportunity = data?.data ?? data

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      await createApplication({ opportunity_id: Number(id), cover_letter: coverLetter.trim() })
      setIsSubmitted(true)
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to submit your application right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <main className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">Loading opportunity...</main>
  }

  if (isError || !opportunity) {
    return <main className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">Unable to load this opportunity.</main>
  }

  if (isSubmitted) {
    return (
      <main className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Application received</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Your application was submitted.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Your application for {opportunity.title} is now pending review.</p>
        <Link to="/opportunities" className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Back to opportunities</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <Link to="/opportunities" className="text-sm font-semibold text-blue-600 hover:text-blue-700">&lt;- Back to opportunities</Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Application</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{opportunity.title}</h1>
      <p className="mt-2 text-sm text-slate-600">Provided by {opportunity.provider_name}</p>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {opportunity.description || 'No description provided.'}
      </div>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label htmlFor="cover-letter" className="block text-sm font-semibold text-slate-800">Why are you a good fit?</label>
        <textarea id="cover-letter" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)} rows="7" maxLength="5000" placeholder="Tell the opportunity provider about your interest and experience..." className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        {submitError ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p> : null}
        <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300">
          {isSubmitting ? 'Submitting application...' : 'Submit application'}
        </button>
      </form>
    </main>
  )
}

export default OpportunityApplicationPage
