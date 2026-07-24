import Modal from './Modal.jsx'

function formatDeadline(deadline) {
  if (!deadline) {
    return 'No deadline'
  }

  const parsed = new Date(deadline)
  if (Number.isNaN(parsed.getTime())) {
    return 'No deadline'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function OpportunityDetailsModal({ isOpen, opportunity, onClose }) {
  if (!isOpen || !opportunity) {
    return null
  }

  const verified = opportunity.is_verified ?? opportunity.verified ?? opportunity.verification_status === 'verified'
  const statusLabel = opportunity.verification_status || (verified ? 'Verified' : 'Unverified')

  return (
    <Modal title="Opportunity details" onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-slate-900">{opportunity.title}</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              {opportunity.category || 'Opportunity'}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              {statusLabel}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">Provided by {opportunity.provider_name || 'Unknown provider'}</p>
          <p className="mt-2 text-sm text-slate-700">Deadline: {formatDeadline(opportunity.application_deadline)}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Description</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{opportunity.description || 'No description provided.'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Eligibility</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{opportunity.eligibility_criteria || 'None specified.'}</p>
          </div>
        </div>

        {opportunity.region_tags?.length ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Regions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {opportunity.region_tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {opportunity.external_link ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Apply or learn more</p>
            <a
              href={opportunity.external_link}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Open application page
            </a>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

export default OpportunityDetailsModal
