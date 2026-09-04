import { useSupportSettings } from '../hooks/useSupportSettings.js'

function AnnouncementTicker() {
  const { settings } = useSupportSettings()
  const announcements = Array.isArray(settings.announcements) ? settings.announcements : []

  if (!settings.announcement_enabled || !announcements.length) {
    return null
  }

  return (
    <aside className="border-b border-amber-200 bg-amber-50 text-amber-950" aria-label="Platform announcement">
      <div className="mx-auto flex max-w-6xl items-stretch overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="z-10 flex shrink-0 items-center border-r border-amber-200 bg-amber-50 py-2 pr-4 text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
          Announcement
        </div>
        <div className="min-w-0 overflow-hidden py-2 pl-4" role="status">
          <div className="announcement-track flex w-max gap-16 whitespace-nowrap text-sm font-medium">
            <span>{announcements.join('  •  ')}</span>
            <span aria-hidden="true">{announcements.join('  •  ')}</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default AnnouncementTicker
