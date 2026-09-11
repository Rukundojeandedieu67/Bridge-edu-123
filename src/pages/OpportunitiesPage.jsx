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
    <main className="bridge-page min-h-screen px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="bridge-hero mb-6 overflow-hidden rounded-[2rem] px-5 py-7 text-white shadow-xl sm:px-9 sm:py-9">
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="bridge-kicker text-orange-300">YOUR NEXT CHAPTER STARTS HERE</p>
              <h1 className="bridge-display mt-3 max-w-2xl text-4xl font-semibold leading-[1.05] sm:text-6xl">
                Learn skills.<br /><span className="text-orange-300">Find your way.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                A clear path from curiosity to opportunity, built for young people across Rwanda.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/pathways" className="bridge-primary-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold">
                  Explore learning paths <span aria-hidden="true">↗</span>
                </Link>
                <a href="#opportunity-list" className="inline-flex items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Browse opportunities
                </a>
              </div>
            </div>

            <div className="bridge-progress-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-300">Your learning pulse</p>
                  <p className="mt-1 text-2xl font-semibold text-white">Keep the momentum</p>
                </div>
                <span className="rounded-full bg-orange-300 px-3 py-1 text-xs font-black text-slate-950">LIVE</span>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-5">
                <div><p className="text-2xl font-semibold text-white">04</p><p className="mt-1 text-xs text-slate-400">Saved paths</p></div>
                <div><p className="text-2xl font-semibold text-white">12</p><p className="mt-1 text-xs text-slate-400">Skills unlocked</p></div>
                <div><p className="text-2xl font-semibold text-white">08</p><p className="mt-1 text-xs text-slate-400">New this week</p></div>
              </div>
              <p className="text-sm leading-6 text-slate-300">Small steps count. Pick one pathway and make progress today.</p>
            </div>
          </div>
        </section>

        <section className="mb-7 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Build a foundation', detail: 'Digital basics', color: 'bg-blue-100 text-blue-900' },
            { label: 'Find your direction', detail: 'Career pathways', color: 'bg-amber-100 text-amber-900' },
            { label: 'Make your move', detail: 'Real opportunities', color: 'bg-orange-100 text-orange-900' },
          ].map((track, index) => (
            <Link key={track.label} to={index === 1 ? '/pathways' : '#opportunity-list'} className="bridge-track group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${track.color}`}>0{index + 1}</span>
              <p className="mt-4 text-base font-bold text-slate-950">{track.label}</p>
              <p className="mt-1 text-sm text-slate-500">{track.detail} <span className="float-right text-lg transition group-hover:translate-x-1">→</span></p>
            </Link>
          ))}
        </section>

        <div id="opportunity-list" className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="bridge-kicker text-orange-600">CURATED FOR YOUR GROWTH</p>
            <h2 className="bridge-display mt-1 text-3xl font-semibold text-slate-950">Opportunities worth chasing</h2>
          </div>
          {isAdmin ? (
            <button type="button" onClick={openCreateModal} className="bridge-dark-button w-full rounded-full px-4 py-2.5 text-sm font-semibold sm:w-auto">+ Add Opportunity</button>
          ) : null}
        </div>

        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

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
