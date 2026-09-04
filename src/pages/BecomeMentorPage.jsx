import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { submitMentorApplication } from '../api/mentorApplications.js'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  abilities: '',
  skills: '',
  qualifications: '',
  experience: '',
  availability: '',
}

function BecomeMentorPage() {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submitMutation = useMutation({ mutationFn: submitMentorApplication })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    try {
      await submitMutation.mutateAsync({
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        abilities: form.abilities,
        skills: form.skills,
        qualifications: form.qualifications,
        experience: form.experience,
        availability: form.availability,
      })
      setSubmitted(true)
      setForm(initialForm)
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Unable to submit your application right now.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <Link to="/mentorship" className="text-sm font-semibold text-blue-600 hover:text-blue-700">&lt;- Back to mentorship</Link>
          <div className="mt-5 border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Become a mentor</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tell us about your abilities, skills, qualifications, and experience. Our team will review your application and contact you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                <span className="mb-1 block">Full name</span>
                <input required name="fullName" value={form.fullName} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                <span className="mb-1 block">Email address</span>
                <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Phone number</span>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">What mentoring abilities can you offer?</span>
              <textarea required name="abilities" value={form.abilities} onChange={handleChange} rows="4" placeholder="For example: career guidance, interview preparation, project coaching" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">What skills or subjects can you teach?</span>
              <textarea required name="skills" value={form.skills} onChange={handleChange} rows="4" placeholder="List your technical, professional, or personal development skills" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Qualifications, certifications, or exams</span>
              <textarea required name="qualifications" value={form.qualifications} onChange={handleChange} rows="4" placeholder="Include degrees, certificates, professional exams, or relevant training" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Relevant mentoring or work experience</span>
              <textarea required name="experience" value={form.experience} onChange={handleChange} rows="4" placeholder="Describe experience that would help you support a learner" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Availability</span>
              <input required name="availability" value={form.availability} onChange={handleChange} placeholder="For example: 2 hours per week, weekday evenings" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500" />
            </label>

            {submitted ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Your application has been received. BridgeEdu will review it and contact you.</p> : null}
            {submitError ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{submitError}</p> : null}
            <button type="submit" disabled={submitMutation.isPending} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto">
              {submitMutation.isPending ? 'Submitting...' : 'Submit mentor application'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default BecomeMentorPage
