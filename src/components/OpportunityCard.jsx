const categoryStyles = {
  scholarship: 'bg-emerald-100 text-emerald-700',
  bootcamp: 'bg-sky-100 text-sky-700',
  micro_task: 'bg-amber-100 text-amber-700',
  grant: 'bg-fuchsia-100 text-fuchsia-700',
}

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

function OpportunityCard({ opportunity, isAdmin, onEdit, onDelete, onView, onApply, canApply, isApplying }) {
  const description = opportunity.description?.trim() || 'No description provided.'
  const truncatedDescription = description.length > 150 ? `${description.slice(0, 147)}...` : description
  const verified = opportunity.is_verified ?? opportunity.verified ?? opportunity.verification_status === 'verified'
  const verificationLabel = opportunity.verification_status || (verified ? 'Verified' : 'Unverified')
  const verificationClass = verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-900">{opportunity.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{opportunity.provider_name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${categoryStyles[opportunity.category] ?? 'bg-slate-100 text-slate-700'}`}>
            {opportunity.category}
          </span>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${verificationClass}`}>
            {verificationLabel}
          </span>
        </div>
      </div>

      <p className="mb-3 text-sm leading-6 text-slate-700">{truncatedDescription}</p>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
          Deadline: {formatDeadline(opportunity.application_deadline)}
        </span>
        {opportunity.region_tags?.length ? (
          opportunity.region_tags.map((tag) => (
            <span key={`${opportunity.id}-${tag}`} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
              {tag}
            </span>
          ))
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        {onView ? (
          <button
            type="button"
            onClick={() => onView(opportunity)}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            View details
          </button>
        ) : opportunity.external_link ? (
          <a
            href={opportunity.external_link}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View details / Apply
          </a>
        ) : null}

        {onApply && canApply ? (
          <button
            type="button"
            onClick={() => onApply(opportunity)}
            disabled={isApplying}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isApplying ? 'Applying…' : 'Apply now'}
          </button>
        ) : null}

        {onApply && !canApply ? (
          <span className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
            Applied
          </span>
        ) : null}

        {opportunity.external_link && !onView ? (
          <a
            href={opportunity.external_link}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Open link
          </a>
        ) : null}

        {isAdmin ? (
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={() => onEdit(opportunity)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(opportunity.id)}
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default OpportunityCard
