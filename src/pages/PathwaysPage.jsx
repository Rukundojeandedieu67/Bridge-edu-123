import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import Modal from '../components/Modal.jsx'
import LessonLearningPanel from '../components/LessonLearningPanel.jsx'
import EvaluationEditor from '../components/EvaluationEditor.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { usePathways } from '../hooks/usePathways.js'

function getCourseProgress(pathway, completedSteps) {
  const steps = pathway.steps ?? []
  const completed = steps.filter((step) => completedSteps.includes(step.id)).length
  return steps.length ? Math.round((completed / steps.length) * 100) : 0
}

function PathwaysPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  const [expandedPathwayId, setExpandedPathwayId] = useState(null)
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false)
  const [editingPathway, setEditingPathway] = useState(null)
  const [pathwayDraft, setPathwayDraft] = useState({ title: '', target_role: '' })
  const [stepDrafts, setStepDrafts] = useState({})
  const [editingStepId, setEditingStepId] = useState(null)
  const [courseSearch, setCourseSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('All courses')
  const [completedSteps, setCompletedSteps] = useState([])
  const [activeLearningView, setActiveLearningView] = useState('catalog')

  const {
    pathways,
    isLoading,
    isError,
    error,
    createPathway,
    updatePathway,
    deletePathway,
    createStep,
    updateStep,
    deleteStep,
  } = usePathways()

  const pathwayList = useMemo(() => pathways?.data ?? [], [pathways])
  const totalUnits = useMemo(() => pathwayList.reduce((total, pathway) => total + (pathway.steps?.length ?? 0), 0), [pathwayList])
  const courseFilters = useMemo(() => ['All courses', ...new Set(pathwayList.map((pathway) => pathway.target_role).filter(Boolean))], [pathwayList])
  const visiblePathways = useMemo(() => {
    const query = courseSearch.trim().toLowerCase()

    return pathwayList.filter((pathway) => {
      const matchesFilter = courseFilter === 'All courses' || pathway.target_role === courseFilter
      const matchesSearch = !query || `${pathway.title} ${pathway.target_role}`.toLowerCase().includes(query)
      const progress = getCourseProgress(pathway, completedSteps)
      const matchesView = activeLearningView === 'catalog'
        || (activeLearningView === 'in-progress' && progress > 0 && progress < 100)
        || (activeLearningView === 'completed' && progress === 100)
      return matchesFilter && matchesSearch && matchesView
    })
  }, [activeLearningView, completedSteps, courseFilter, courseSearch, pathwayList])

  const resetPathwayDraft = () => {
    setPathwayDraft({ title: '', target_role: '' })
    setEditingPathway(null)
  }

  const openPathwayModal = (pathway = null) => {
    if (pathway) {
      setEditingPathway(pathway)
      setPathwayDraft({ title: pathway.title, target_role: pathway.target_role })
    } else {
      resetPathwayDraft()
    }

    setIsPathwayModalOpen(true)
  }

  const closePathwayModal = () => {
    setIsPathwayModalOpen(false)
    resetPathwayDraft()
  }

  const handlePathwaySubmit = async (event) => {
    event.preventDefault()

    if (editingPathway?.id) {
      await updatePathway({ id: editingPathway.id, data: pathwayDraft })
    } else {
      await createPathway(pathwayDraft)
    }

    closePathwayModal()
  }

  const handleDeletePathway = async (pathwayId) => {
    await deletePathway(pathwayId)
  }

  const openStepEditor = (pathwayId, step) => {
    setExpandedPathwayId(pathwayId)
    setEditingStepId(step?.id ?? null)
    setStepDrafts((current) => ({
      ...current,
      [pathwayId]: {
        position: step?.position ?? '',
        title: step?.title ?? '',
        description: step?.description ?? '',
        resource_link: step?.resource_link ?? '',
        resource_type: step?.resource_type ?? 'article',
        estimated_hours: step?.estimated_hours ?? '',
      },
    }))
  }

  const handleStepSubmit = async (event, pathwayId) => {
    event.preventDefault()

    const payload = stepDrafts[pathwayId] || {}

    if (editingStepId) {
      await updateStep({
        pathwayId,
        stepId: editingStepId,
        data: payload,
      })
    } else {
      await createStep({ pathwayId, data: payload })
    }

    setEditingStepId(null)
    setStepDrafts((current) => ({ ...current, [pathwayId]: undefined }))
  }

  const handleDeleteStep = async (pathwayId, stepId) => {
    await deleteStep({ pathwayId, stepId })
  }

  return (
    <main className="bridge-page min-h-screen px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <section className="bridge-hero mb-6 overflow-hidden rounded-[2rem] px-5 py-7 text-white shadow-xl sm:px-9 sm:py-9">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="bridge-kicker text-orange-300">YOUR ROADMAP TO WHAT IS NEXT</p>
              <h1 className="bridge-display mt-3 text-4xl font-semibold leading-tight sm:text-5xl">Learn with direction.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">Follow practical steps, build confidence, and turn the skills you are learning into your next opportunity.</p>
            </div>
            <div className="bridge-progress-panel rounded-2xl p-4 md:min-w-[15rem]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Learning dashboard</p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div><p className="text-2xl font-semibold text-white">{pathwayList.length}</p><p className="text-xs text-slate-400">Courses</p></div>
                <div><p className="text-2xl font-semibold text-white">{totalUnits}</p><p className="text-xs text-slate-400">Units</p></div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="bridge-kicker text-orange-600">BRIDGEEDU COURSE LIBRARY</p>
            <h2 className="bridge-display mt-1 text-2xl font-semibold text-slate-950">Learn something useful</h2>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => openPathwayModal()}
              className="bridge-dark-button w-full rounded-full px-4 py-2.5 text-sm font-semibold sm:w-auto"
            >
              + Add Pathway
            </button>
          ) : null}
        </div>

        {isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error?.response?.data?.message || 'Unable to load pathways right now.'}
          </div>
        ) : null}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-4">
            {[['catalog', 'Course catalog'], ['in-progress', 'My learning'], ['completed', 'Completed']].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setActiveLearningView(value)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeLearningView === value ? 'bg-[#0e4770] text-white' : 'text-slate-600 hover:bg-amber-100 hover:text-amber-900'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">Find your next course</p>
              <p className="mt-1 text-sm text-slate-500">Short, practical learning paths built around real roles.</p>
            </div>
            <label className="w-full lg:max-w-sm">
              <span className="sr-only">Search courses</span>
              <input
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="Search courses or careers"
                className="w-full rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {courseFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCourseFilter(filter)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${courseFilter === filter ? 'bg-[#0e4770] text-white' : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-900'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 h-4 w-32 rounded bg-slate-200" />
                <div className="mb-2 h-4 w-44 rounded bg-slate-200" />
                <div className="h-20 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : visiblePathways.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-700 shadow-sm">
            No courses match your search yet.
          </div>
        ) : (
          <div className="space-y-4">
            {visiblePathways.map((pathway) => {
              const isExpanded = expandedPathwayId === pathway.id
              const steps = pathway.steps ?? []
              const courseProgress = getCourseProgress(pathway, completedSteps)

              return (
                <section key={pathway.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:shadow-md sm:p-5">
                  <Link
                    to={`/pathways/${pathway.id}`}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-orange-900">Course</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{steps.length} lessons</span>
                      </div>
                      <h2 className="text-xl font-semibold text-slate-950">{pathway.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">Build toward <span className="font-semibold text-[#0e4770]">{pathway.target_role}</span></p>
                      <div className="mt-4 max-w-md">
                        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500"><span>{courseProgress ? 'Continue learning' : 'Not started'}</span><span>{courseProgress}%</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-[#0e4770] to-orange-400" style={{ width: `${courseProgress}%` }} /></div>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {isExpanded ? 'Close course' : courseProgress ? 'Resume course' : 'Open course'}
                    </span>
                  </Link>

                  {isExpanded ? (
                    <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openPathwayModal(pathway)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
                            >
                              Edit Pathway
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePathway(pathway.id)}
                              className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700"
                            >
                              Delete Pathway
                            </button>
                          </>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        {steps.map((step, index) => (
                          <div key={step.id} id={`lesson-${step.id}`} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                                {index + 1}
                              </div>
                              {index < steps.length - 1 ? (
                                <div className="mt-1 h-full w-px bg-slate-300" />
                              ) : null}
                            </div>

                            <div className={`flex-1 rounded-xl p-3 ${completedSteps.includes(step.id) ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50'}`}>
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h3 className="font-semibold text-slate-900">{step.title} {completedSteps.includes(step.id) ? <span className="ml-2 text-xs font-bold text-emerald-700">Completed</span> : null}</h3>
                                  <p className="text-sm text-slate-700">{step.description}</p>
                                  <p className="mt-1 text-xs text-slate-600">~{step.estimated_hours} hours</p>
                                </div>

                                {step.resource_link ? <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-orange-900">{step.resource_type || 'article'}</span> : null}
                              </div>

                              {isAdmin ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openStepEditor(pathway.id, step)}
                                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
                                  >
                                    Edit Step
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStep(pathway.id, step.id)}
                                    className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700"
                                  >
                                    Delete Step
                                  </button>
                                </div>
                              ) : null}

                              <LessonLearningPanel
                                step={step}
                                onContinue={() => {
                                  setCompletedSteps((current) => current.includes(step.id) ? current : [...current, step.id])
                                  const nextStep = steps[index + 1]
                                  if (nextStep) {
                                    window.setTimeout(() => document.getElementById(`lesson-${nextStep.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0)
                                  }
                                }}
                              />
                              {isAdmin ? <EvaluationEditor step={step} /> : null}
                            </div>
                          </div>
                        ))}
                      </div>

                      {isAdmin ? (
                        <form onSubmit={(event) => handleStepSubmit(event, pathway.id)} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {editingStepId ? 'Update step' : '+ Add Step'}
                          </h3>

                          <div className="grid gap-3 md:grid-cols-2">
                            <label className="text-sm font-medium text-slate-700">
                              <span className="mb-1 block">Position</span>
                              <input
                                type="number"
                                min="1"
                                value={stepDrafts[pathway.id]?.position ?? ''}
                                onChange={(event) =>
                                  setStepDrafts((current) => ({
                                    ...current,
                                    [pathway.id]: {
                                      ...(current[pathway.id] ?? {}),
                                      position: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </label>

                            <label className="text-sm font-medium text-slate-700 md:col-span-2">
                              <span className="mb-1 block">Title</span>
                              <input
                                value={stepDrafts[pathway.id]?.title ?? ''}
                                onChange={(event) =>
                                  setStepDrafts((current) => ({
                                    ...current,
                                    [pathway.id]: {
                                      ...(current[pathway.id] ?? {}),
                                      title: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </label>

                            <label className="text-sm font-medium text-slate-700 md:col-span-2">
                              <span className="mb-1 block">Description</span>
                              <textarea
                                rows="3"
                                value={stepDrafts[pathway.id]?.description ?? ''}
                                onChange={(event) =>
                                  setStepDrafts((current) => ({
                                    ...current,
                                    [pathway.id]: {
                                      ...(current[pathway.id] ?? {}),
                                      description: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                              <span className="mb-1 block">Resource link <span className="font-normal text-slate-500">(YouTube or MP4 URL)</span></span>
                              <input
                                value={stepDrafts[pathway.id]?.resource_link ?? ''}
                                onChange={(event) =>
                                  setStepDrafts((current) => ({
                                    ...current,
                                    [pathway.id]: {
                                      ...(current[pathway.id] ?? {}),
                                      resource_link: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                              <span className="mb-1 block">Resource type</span>
                              <select
                                value={stepDrafts[pathway.id]?.resource_type ?? 'article'}
                                onChange={(event) =>
                                  setStepDrafts((current) => ({
                                    ...current,
                                    [pathway.id]: {
                                      ...(current[pathway.id] ?? {}),
                                      resource_type: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                              >
                                <option value="article">Article</option>
                                <option value="book">Book / study guide</option>
                                <option value="presentation">Presentation</option>
                                <option value="video">YouTube video</option>
                              </select>
                            </label>

                            <label className="text-sm font-medium text-slate-700">
                              <span className="mb-1 block">Estimated hours</span>
                              <input
                                type="number"
                                min="0"
                                value={stepDrafts[pathway.id]?.estimated_hours ?? ''}
                                onChange={(event) =>
                                  setStepDrafts((current) => ({
                                    ...current,
                                    [pathway.id]: {
                                      ...(current[pathway.id] ?? {}),
                                      estimated_hours: event.target.value,
                                    },
                                  }))
                                }
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                              />
                            </label>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="submit"
                              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
                            >
                              {editingStepId ? 'Save Step' : 'Add Step'}
                            </button>

                            {editingStepId ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStepId(null)
                                  setStepDrafts((current) => ({ ...current, [pathway.id]: undefined }))
                                }}
                                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 sm:w-auto"
                              >
                                Cancel
                              </button>
                            ) : null}
                          </div>
                        </form>
                      ) : null}
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
        )}
      </div>

      {isPathwayModalOpen ? (
        <Modal title={editingPathway ? 'Edit pathway' : 'Add pathway'} onClose={closePathwayModal}>
          <form onSubmit={handlePathwaySubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Title</span>
              <input
                value={pathwayDraft.title}
                onChange={(event) => setPathwayDraft((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Target role</span>
              <input
                value={pathwayDraft.target_role}
                onChange={(event) => setPathwayDraft((current) => ({ ...current, target_role: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={closePathwayModal} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 sm:w-auto">
                Cancel
              </button>
              <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto">
                {editingPathway ? 'Update pathway' : 'Create pathway'}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </main>
  )
}

export default PathwaysPage
