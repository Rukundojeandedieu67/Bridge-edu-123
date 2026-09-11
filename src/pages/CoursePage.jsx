import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeCourseStep, enrollInCourse, getEnrollment } from '../api/enrollments.js'
import { getPathway } from '../api/pathways.js'
import EvaluationEditor from '../components/EvaluationEditor.jsx'
import LessonLearningPanel from '../components/LessonLearningPanel.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function CoursePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const canLearn = user?.role === 'student' || user?.role === 'mentor'
  const queryClient = useQueryClient()
  const [expandedStepId, setExpandedStepId] = useState(null)

  const courseQuery = useQuery({ queryKey: ['pathway', id], queryFn: () => getPathway(id) })
  const enrollmentQuery = useQuery({
    queryKey: ['enrollment', id],
    queryFn: () => getEnrollment(id),
    enabled: Boolean(canLearn),
  })
  const enrollMutation = useMutation({
    mutationFn: () => enrollInCourse(id),
    onSuccess: (data) => queryClient.setQueryData(['enrollment', id], data),
  })
  const completeMutation = useMutation({
    mutationFn: (stepId) => completeCourseStep(id, stepId),
    onSuccess: (data) => queryClient.setQueryData(['enrollment', id], data),
  })

  const course = courseQuery.data?.data ?? courseQuery.data
  const steps = course?.steps ?? []
  const enrollment = enrollmentQuery.data?.data || null
  const completedStepIds = enrollment?.completed_step_ids ?? []
  const progress = enrollment?.progress ?? 0
  const activeStepId = expandedStepId ?? steps[0]?.id
  const activeStep = steps.find((step) => step.id === activeStepId)
  const firstStepId = steps[0]?.id

  useEffect(() => {
    if (!expandedStepId && firstStepId) setExpandedStepId(firstStepId)
  }, [expandedStepId, firstStepId])

  if (courseQuery.isLoading) return <main className="bridge-page min-h-screen p-8 text-center text-slate-600">Loading course...</main>
  if (courseQuery.isError || !course) return <main className="bridge-page min-h-screen p-8 text-center text-rose-700">Unable to load this course.</main>

  return (
    <main className="bridge-page min-h-screen px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/pathways" className="text-sm font-bold text-[#0e4770] hover:underline">← Back to course catalog</Link>
        <section className="bridge-hero mt-4 overflow-hidden rounded-[2rem] px-5 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div>
              <p className="bridge-kicker text-orange-300">BRIDGEEDU COURSE</p>
              <h1 className="bridge-display mt-3 text-4xl font-semibold sm:text-6xl">{course.title}</h1>
              <p className="mt-4 text-lg text-slate-200">Build toward <strong className="text-orange-300">{course.target_role}</strong> through {steps.length} practical units.</p>
            </div>
            <div className="bridge-progress-panel rounded-2xl p-5">
              <div className="flex items-end justify-between"><span className="text-sm text-slate-300">Your progress</span><strong className="text-3xl text-white">{progress}%</strong></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-orange-300 transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-3 text-xs text-slate-300">{completedStepIds.length} of {steps.length} units completed</p>
            </div>
          </div>
        </section>

        {!user ? (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-bold text-slate-950">Ready to start this course?</p><p className="mt-1 text-sm text-slate-600">Create a learner account to enroll, save notes, and receive marks.</p></div>
            <Link to={`/login?redirect=/pathways/${id}`} className="bridge-dark-button rounded-full px-5 py-2.5 text-center text-sm font-bold">Sign in to enroll</Link>
          </section>
        ) : canLearn && !enrollment ? (
          <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-bold text-slate-950">Enroll in this course</p><p className="mt-1 text-sm text-slate-600">Your progress and completed units will be saved to your learner account.</p></div>
            <button type="button" onClick={() => enrollMutation.mutate()} disabled={enrollMutation.isPending} className="bridge-primary-button rounded-full px-5 py-2.5 text-sm font-bold">{enrollMutation.isPending ? 'Enrolling...' : 'Enroll now'}</button>
          </section>
        ) : null}

        {enrollment?.is_completed ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-bold text-emerald-800">Course completed. Your learning record is saved.</div> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[18rem_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="bridge-kicker text-orange-600">COURSE UNITS</p>
            <div className="mt-4 space-y-2">
              {steps.map((step, index) => {
                const completed = completedStepIds.includes(step.id)
                return <button key={step.id} type="button" onClick={() => setExpandedStepId(step.id)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${activeStepId === step.id ? 'bg-[#0e4770] text-white' : 'hover:bg-slate-50'}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${completed ? 'bg-emerald-500 text-white' : activeStepId === step.id ? 'bg-orange-300 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>{completed ? '✓' : index + 1}</span><span className="min-w-0"><span className="block truncate text-sm font-bold">{step.title}</span><span className={`text-xs ${activeStepId === step.id ? 'text-slate-300' : 'text-slate-500'}`}>{step.estimated_hours || 0} hours</span></span></button>
              })}
            </div>
          </aside>

          {activeStep ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="bridge-kicker text-orange-600">UNIT {steps.findIndex((step) => step.id === activeStep.id) + 1}</p><h2 className="bridge-display mt-2 text-3xl font-semibold text-slate-950">{activeStep.title}</h2><p className="mt-3 leading-7 text-slate-600">{activeStep.description}</p></div>
                {completedStepIds.includes(activeStep.id) ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Completed</span> : null}
              </div>
              {canLearn && !enrollment ? <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Enroll in this course to start the unit and save your result.</div> : <LessonLearningPanel step={activeStep} onContinue={() => completeMutation.mutate(activeStep.id)} />}
              {isAdmin ? <EvaluationEditor step={activeStep} /> : null}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default CoursePage
