import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OpportunityCard from '../components/OpportunityCard.jsx'
import OpportunityDetailsModal from '../components/OpportunityDetailsModal.jsx'
import OpportunityFormModal from '../components/OpportunityFormModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useOpportunityApplications } from '../hooks/useOpportunityApplications.js'
import { useOpportunities } from '../hooks/useOpportunities.js'
import { useSupportSettings } from '../hooks/useSupportSettings.js'

const categoryOptions = ['all', 'scholarship', 'bootcamp', 'micro_task', 'grant']

function OpportunitiesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const { settings: supportSettings } = useSupportSettings()

  const [category, setCategory] = useState('all')
  const [region, setRegion] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState(null)
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [applicationFeedback, setApplicationFeedback] = useState('')
  const [verificationFeedback, setVerificationFeedback] = useState('')

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
  const {
    applications,
  } = useOpportunityApplications({ enabled: Boolean(user) })

  const list = opportunities?.data ?? []
  const meta = opportunities?.meta ?? {}
  const currentPage = meta.current_page ?? 1
  const lastPage = meta.last_page ?? 1
  const whatsappNumber = String(supportSettings.whatsapp_number ?? '').replace(/[^0-9]/g, '')
  const supportUserName = user?.full_name || user?.name || 'a BridgeEdu visitor'
  const getWhatsappHelpUrl = (opportunity) => whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I am ${supportUserName}. I need help on ${opportunity.title}.`)}`
    : null
  const appliedOpportunityIds = useMemo(() => new Set((applications ?? []).map((application) => application.opportunity?.id ?? application.opportunity_id)), [applications])

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

  const handleToggleVerification = async (opportunity) => {
    setVerificationFeedback('')

    try {
      const verified = opportunity.is_verified ?? opportunity.verified ?? opportunity.verification_status === 'verified'
      await updateOpportunity({ id: opportunity.id, data: { is_verified: !verified } })
      setVerificationFeedback(`${opportunity.title} is now ${verified ? 'unverified' : 'verified'}.`)
    } catch (error) {
      setVerificationFeedback(error?.response?.data?.message || 'Unable to change the verification status.')
    }
  }

  const openDetails = (opportunity) => {
    setSelectedOpportunity(opportunity)
  }

  const closeDetails = () => {
    setSelectedOpportunity(null)
  }

  const canApplyToOpportunity = (opportunity) => {
    const role = user?.role
    if (!role || isAdmin) return false
    if (role === 'student' || role === 'mentor') {
      return !appliedOpportunityIds.has(opportunity.id)
    }
    return false
  }

  const handleApply = (opportunity) => {
    if (opportunity.external_link) {
      window.open(opportunity.external_link, '_blank', 'noopener,noreferrer')
      return
    }

    navigate(`/opportunities/${opportunity.id}/apply`)
  }

  const handleGuestApply = (opportunity) => {
    const destination = opportunity?.external_link || `/opportunities/${opportunity.id}/apply`
    navigate(`/login?redirect=${encodeURIComponent(destination)}`)
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

          {applicationFeedback ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {applicationFeedback}
            </div>
          ) : null}

          {!user ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              Browse freely. <Link to="/login" className="font-semibold underline">Sign in</Link> to apply.
            </div>
          ) : null}

          {verificationFeedback ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {verificationFeedback}
            </div>
          ) : null}

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
                requiresLogin={!user}
                whatsappHelpUrl={getWhatsappHelpUrl(opportunity)}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onToggleVerification={handleToggleVerification}
                onView={openDetails}
                onApply={isAdmin ? null : user ? handleApply : handleGuestApply}
                canApply={user ? canApplyToOpportunity(opportunity) : true}
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

        <OpportunityDetailsModal
          opportunity={selectedOpportunity}
          isOpen={Boolean(selectedOpportunity)}
          onClose={closeDetails}
          onApply={isAdmin ? null : user ? handleApply : handleGuestApply}
          requiresLogin={!user}
        />
      </div>
    </main>
  )
}

export default OpportunitiesPage
