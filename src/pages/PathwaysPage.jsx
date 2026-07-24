import { useMemo, useState } from 'react'
import Modal from '../components/Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { usePathways } from '../hooks/usePathways.js'

function PathwaysPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'

  const [expandedPathwayId, setExpandedPathwayId] = useState(null)
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false)
  const [editingPathway, setEditingPathway] = useState(null)
  const [pathwayDraft, setPathwayDraft] = useState({ title: '', target_role: '' })
  const [stepDrafts, setStepDrafts] = useState({})
  const [editingStepId, setEditingStepId] = useState(null)

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
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Pathways</h1>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={() => openPathwayModal()}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
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
        ) : pathwayList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-700 shadow-sm">
            No pathways available right now.
          </div>
        ) : (
          <div className="space-y-4">
            {pathwayList.map((pathway) => {
              const isExpanded = expandedPathwayId === pathway.id
              const steps = pathway.steps ?? []

              return (
                <section key={pathway.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <button
                    type="button"
                    onClick={() => setExpandedPathwayId(isExpanded ? null : pathway.id)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{pathway.title}</h2>
                      <p className="text-sm text-slate-600">{pathway.target_role} · {steps.length} steps</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {isExpanded ? 'Hide' : 'Show'}
                    </span>
                  </button>

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
                          <div key={step.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                                {index + 1}
                              </div>
                              {index < steps.length - 1 ? (
                                <div className="mt-1 h-full w-px bg-slate-300" />
                              ) : null}
                            </div>

                            <div className="flex-1 rounded-xl bg-slate-50 p-3">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                                  <p className="text-sm text-slate-700">{step.description}</p>
                                  <p className="mt-1 text-xs text-slate-600">~{step.estimated_hours} hours</p>
                                </div>

                                {step.resource_link ? (
                                  <a
                                    href={step.resource_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                  >
                                    Resource
                                  </a>
                                ) : null}
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
                              <span className="mb-1 block">Resource link</span>
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
