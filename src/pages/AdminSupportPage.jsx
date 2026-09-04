import { useEffect, useState } from 'react'
import AdminNavigation from '../components/AdminNavigation.jsx'
import { useSupportSettings } from '../hooks/useSupportSettings.js'

function AdminSupportPage() {
  const { settings, updateSettings, isUpdating } = useSupportSettings()
  const [form, setForm] = useState({ whatsapp_number: '', support_email: '', support_message: '', announcement_enabled: false, ad_enabled: true, ad_title: '', ad_message: '' })
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setForm({
      whatsapp_number: settings.whatsapp_number ?? '',
      support_email: settings.support_email ?? '',
      support_message: settings.support_message ?? '',
      announcement_enabled: Boolean(settings.announcement_enabled),
      ad_enabled: Boolean(settings.ad_enabled),
      ad_title: settings.ad_title ?? '',
      ad_message: settings.ad_message ?? '',
    })
  }, [settings])

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback('')
    try {
      await updateSettings({ ...form, announcement_text: '' })
      setFeedback('Support and advertising settings saved.')
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to save settings.')
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminNavigation />
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Platform communication</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Support, announcements and ads</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Control the help chatbot, WhatsApp contact, public awareness message, and live content announcement ticker.</p>
          {feedback ? <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{feedback}</p> : null}
          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-800">WhatsApp number<input value={form.whatsapp_number} onChange={(event) => updateField('whatsapp_number', event.target.value)} placeholder="+250 7XX XXX XXX" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-800">Support email<input type="email" value={form.support_email} onChange={(event) => updateField('support_email', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="text-sm font-semibold text-slate-800 md:col-span-2">Chatbot welcome message<input value={form.support_message} onChange={(event) => updateField('support_message', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800"><input type="checkbox" checked={form.announcement_enabled} onChange={(event) => updateField('announcement_enabled', event.target.checked)} /> Show live content ticker</label>
            <p className="text-sm text-slate-500">The ticker automatically lists all opportunity titles, pathways, and available mentorship.</p>
            <label className="text-sm font-semibold text-slate-800">Awareness ad title<input value={form.ad_title} onChange={(event) => updateField('ad_title', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-slate-800"><input type="checkbox" checked={form.ad_enabled} onChange={(event) => updateField('ad_enabled', event.target.checked)} /> Show awareness ad</label>
            <label className="text-sm font-semibold text-slate-800 md:col-span-2">Awareness ad message<textarea rows="3" value={form.ad_message} onChange={(event) => updateField('ad_message', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <button type="submit" disabled={isUpdating} className="w-fit rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">{isUpdating ? 'Saving...' : 'Save settings'}</button>
          </form>
        </section>
      </div>
    </main>
  )
}

export default AdminSupportPage
