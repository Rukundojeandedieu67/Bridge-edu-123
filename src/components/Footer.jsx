import { Link } from 'react-router-dom'
import logo from '../assets/bridge-edu.png'
import { useState } from 'react'
import { useNewsletter } from '../hooks/useNewsletter.js'
import { useSupportSettings } from '../hooks/useSupportSettings.js'

function Footer() {
  const { subscribe, isSubscribing } = useNewsletter()
  const { settings } = useSupportSettings()
  const [email, setEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const supportEmail = settings.support_email || 'hello@bridgeedu.rw'
  const supportMessage = settings.support_message || 'Questions about opportunities or joining the network?'
  const contactLocation = settings.contact_location || 'Huye, Rwanda'
  const whatsappNumber = String(settings.whatsapp_number || '').replace(/[^0-9]/g, '')

  const handleSubscribe = async (event) => {
    event.preventDefault()
    setNewsletterMessage('')
    try {
      const response = await subscribe(email)
      setNewsletterMessage(response.message)
      setEmail('')
    } catch (error) {
      setNewsletterMessage(error?.response?.data?.message || 'Please enter a valid email address.')
    }
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-slate-800 pb-10 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="max-w-sm">
            <Link to="/opportunities" className="inline-flex items-center gap-3 text-white">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
                <img src={logo} alt="BridgeEdu logo" className="h-full w-full object-contain" />
              </span>
              <span className="text-lg font-semibold tracking-tight">BridgeEdu Rwanda</span>
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              A trusted bridge between young people, practical learning, and meaningful opportunity.
            </p>
            <Link to="/opportunities" className="mt-5 inline-flex items-center text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
              Explore opportunities <span className="ml-2" aria-hidden="true">-&gt;</span>
            </Link>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Explore</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/opportunities" className="transition hover:text-white">Opportunities</Link></li>
              <li><Link to="/pathways" className="transition hover:text-white">Learning pathways</Link></li>
              <li><Link to="/mentorship" className="transition hover:text-white">Mentorship</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Community</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link to="/become-a-mentor" className="transition hover:text-white">Become a mentor</Link></li>
              <li><Link to="/register" className="transition hover:text-white">Create an account</Link></li>
              <li><Link to="/login" className="transition hover:text-white">Sign in</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">Contact</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">{supportMessage}</p>
            <a href={`mailto:${supportEmail}`} className="mt-3 inline-block text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
              {supportEmail}
            </a>
            {whatsappNumber ? <a href={`https://wa.me/${whatsappNumber}`} className="mt-2 block text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">WhatsApp support</a> : null}
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">{contactLocation}</p>
          </div>
        </div>

        <div className="mt-10 border-y border-slate-800 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Stay connected</h2>
              <p className="mt-1 text-sm text-slate-400">Receive new opportunities, pathways, and community updates.</p>
            </div>
            <form onSubmit={handleSubscribe} className="flex w-full max-w-xl flex-col gap-2 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input id="newsletter-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none" />
              <button type="submit" disabled={isSubscribing} className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:opacity-60">{isSubscribing ? 'Subscribing...' : 'Subscribe'}</button>
            </form>
          </div>
          {newsletterMessage ? <p className="mt-2 text-sm text-cyan-300" role="status">{newsletterMessage}</p> : null}
        </div>
      </div>

      <div className="border-t border-slate-900 px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BridgeEdu Rwanda. All rights reserved.</p>
          <p>Built for learning, access, and growth.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
