import { useEffect, useState } from 'react'
import { useAds } from '../hooks/useAds.js'

function AwarenessAd() {
  const { ads } = useAds()
  const [activeIndex, setActiveIndex] = useState(0)
  const ad = ads[activeIndex % Math.max(ads.length, 1)]

  useEffect(() => {
    if (ads.length < 2) return undefined
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % ads.length), 15000)
    return () => window.clearInterval(timer)
  }, [ads.length])

  if (!ad) {
    return null
  }

  return (
    <aside className="border-b border-cyan-900 bg-cyan-950 text-white" aria-label="BridgeEdu advertisement" aria-live="polite">
      <div key={ad.id} className="ad-fade-in mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-300" aria-hidden="true" />
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">BridgeEdu focus</p>
          </div>
          <p className="mt-1 text-base font-semibold">{ad.title}</p>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-cyan-50 sm:flex-1 sm:px-6">{ad.message}</p>
        <div className="flex items-center gap-4">
          {ads.length > 1 ? <span className="text-xs font-medium text-cyan-200">{activeIndex + 1} / {ads.length}</span> : null}
          {ad.link ? <a href={ad.link} target="_blank" rel="noreferrer" className="shrink-0 text-sm font-semibold text-cyan-200 underline underline-offset-2 hover:text-white">Learn more</a> : null}
        </div>
      </div>
    </aside>
  )
}

export default AwarenessAd