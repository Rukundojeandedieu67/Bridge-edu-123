import { useEffect, useRef } from 'react'

function getYoutubeEmbedUrl(value) {
  if (!value) return null

  try {
    const url = new URL(value)
    let videoId = url.searchParams.get('v')

    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1)
    }

    if (url.pathname.startsWith('/shorts/')) {
      videoId = url.pathname.split('/')[2]
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}

function YoutubeLessonPlayer({ url, onTimeUpdate, onPlayerReady }) {
  const iframeRef = useRef(null)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const onPlayerReadyRef = useRef(onPlayerReady)

  onTimeUpdateRef.current = onTimeUpdate
  onPlayerReadyRef.current = onPlayerReady

  useEffect(() => {
    let player
    let timer
    let poll
    let cancelled = false

    const initializeTracking = () => {
      if (cancelled || player || !iframeRef.current || !window.YT?.Player) return Boolean(player)

      player = new window.YT.Player(iframeRef.current)
      onPlayerReadyRef.current?.({
        pause: () => player.pauseVideo(),
        play: () => player.playVideo(),
      })
      timer = window.setInterval(() => {
        if (player?.getCurrentTime) onTimeUpdateRef.current?.(player.getCurrentTime())
      }, 1000)
      window.clearInterval(poll)
      return true
    }

    if (!window.YT?.Player && !document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(script)
    }

    initializeTracking()
    poll = window.setInterval(initializeTracking, 250)

    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.clearInterval(poll)
      player?.destroy?.()
    }
  }, [url])

  const embedUrl = `${getYoutubeEmbedUrl(url)}?enablejsapi=1&controls=1&iv_load_policy=3&modestbranding=1&playsinline=1&rel=0`

  return (
    <iframe
      ref={iframeRef}
      title="Lesson video"
      src={embedUrl}
      className="h-full w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  )
}

const resourceLabels = {
  video: 'Watch video',
  book: 'Read study guide',
  presentation: 'Open presentation',
  article: 'Read resource',
}

function LearningResource({ type = 'article', url, onTimeUpdate, onPlayerReady }) {
  if (!url) return null

  if (type === 'video') {
    const embedUrl = getYoutubeEmbedUrl(url)

    if (embedUrl) {
      return (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
          <div className="px-3 py-2"><span className="bridge-kicker text-orange-300">VIDEO LESSON</span></div>
          <div className="aspect-video">
            <YoutubeLessonPlayer url={url} onTimeUpdate={onTimeUpdate} onPlayerReady={onPlayerReady} />
          </div>
        </div>
      )
    }

    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <div className="px-3 py-2"><span className="bridge-kicker text-orange-300">VIDEO LESSON</span></div>
        <video
          src={url}
          controls
          playsInline
          preload="metadata"
          className="aspect-video w-full"
          onLoadedMetadata={(event) => onPlayerReady?.({ pause: () => event.currentTarget.pause(), play: () => event.currentTarget.play() })}
          onTimeUpdate={(event) => onTimeUpdate?.(event.currentTarget.currentTime)}
        >
          Your browser does not support video playback.
        </video>
      </div>
    )
  }

  if (type === 'presentation' && /\.pdf(?:$|\?)/i.test(url)) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-orange-200 bg-white">
        <div className="flex items-center justify-between bg-orange-50 px-4 py-3">
          <span className="bridge-kicker text-orange-800">PRESENTATION</span>
          <a href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-orange-900 hover:underline">Open full screen ↗</a>
        </div>
        <iframe title="Lesson presentation" src={url} className="h-[28rem] w-full" loading="lazy" />
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 transition hover:border-orange-400 hover:bg-orange-100"
    >
      <span>
        <span className="bridge-kicker block text-orange-800">{type.toUpperCase()}</span>
        <span className="mt-1 block text-sm font-bold text-slate-950">{resourceLabels[type] || resourceLabels.article}</span>
      </span>
      <span className="text-lg text-orange-800" aria-hidden="true">↗</span>
    </a>
  )
}

export default LearningResource
