import { useEffect, useMemo, useState } from 'react'
import OpportunityCard from '../components/OpportunityCard.jsx'
import OpportunityFormModal from '../components/OpportunityFormModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useOpportunities } from '../hooks/useOpportunities.js'

const categoryOptions = ['all', 'scholarship', 'bootcamp', 'micro_task', 'grant']

function OpportunitiesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search])

  const filters = useMemo(
    () => ({
      category: category === 'all' ? '' : category,
      region,
      search: debouncedSearch,
      upcoming: upcomingOnly,
      page,
    }),
    [category, region, debouncedSearch, upcomingOnly, page],
  )

  const {
    opportunities,
    isLoading,
    isFetching,
    isError,
    error,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
  } = useOpportunities(filters)

  const list = opportunities?.data ?? []
  const meta = opportunities?.meta ?? {}
  const currentPage = meta.current_page ?? 1
  const lastPage = meta.last_page ?? 1

  const openCreateModal = () => {
    setEditingOpportunity(null)
    setIsModalOpen(true)
  }

  const openEditModal = (opportunity) => {
    setEditingOpportunity(opportunity)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingOpportunity(null)
  }

  const handleCreateOrUpdate = async (payload) => {
    if (editingOpportunity?.id) {
      await updateOpportunity({ id: editingOpportunity.id, data: payload })
      return
    }

    await createOpportunity(payload)
  }

  const handleDelete = async (id) => {
    await deleteOpportunity(id)
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Opportunities</h1>
            </div>

            {isAdmin ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
              >
                + Add Opportunity
              </button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Category</span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value)
                  setPage(1)
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'All' : option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-1 block">Region</span>
              <input
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value)
                  setPage(1)
                }}
                placeholder="Filter by region"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700 sm:col-span-2 xl:col-span-2">
              <span className="mb-1 block">Search</span>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search title or provider"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
              />
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 sm:col-span-2 xl:col-span-1">
              <input
                type="checkbox"
                checked={upcomingOnly}
                onChange={(event) => {
                  setUpcomingOnly(event.target.checked)
                  setPage(1)
                }}
              />
              Upcoming only
            </label>
          </div>
        </div>

        {isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error?.response?.data?.message || 'Unable to load opportunities right now.'}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-3 h-4 w-32 rounded bg-slate-200" />
                <div className="mb-2 h-4 w-44 rounded bg-slate-200" />
                <div className="h-20 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-slate-700 shadow-sm">
            No opportunities match your filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((opportunity) => (
              <OpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                isAdmin={isAdmin}
                onEdit={openEditModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Previous
          </button>

          <span className="text-center text-sm text-slate-700">
            Page {currentPage} of {lastPage}
          </span>

          <button
            type="button"
            disabled={page >= lastPage || isFetching}
            onClick={() => setPage((current) => current + 1)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Next
          </button>
        </div>

        <OpportunityFormModal
          isOpen={isModalOpen}
          mode={editingOpportunity ? 'edit' : 'create'}
          initialData={editingOpportunity}
          onClose={closeModal}
          onSubmit={handleCreateOrUpdate}
        />
      </div>
    </main>
  )
}

export default OpportunitiesPage
