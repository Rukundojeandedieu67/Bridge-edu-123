import { useEffect, useState } from 'react'
import AdminNavigation from '../components/AdminNavigation.jsx'
import { useSupportSettings } from '../hooks/useSupportSettings.js'
import { useAuth } from '../context/AuthContext.jsx'

function AdminSupportPage() {
  const { settings, updateSettings, isUpdating } = useSupportSettings()
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const [form, setForm] = useState({ whatsapp_number: '', support_email: '', support_message: '', contact_location: '', announcement_enabled: false, ad_enabled: true, ad_title: '', ad_message: '', smtp_enabled: false, smtp_host: '', smtp_port: 587, smtp_username: '', smtp_password: '', smtp_encryption: 'tls', smtp_from_email: '', smtp_from_name: 'BridgeEdu Rwanda' })
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    setForm({
      whatsapp_number: settings.whatsapp_number ?? '',
      support_email: settings.support_email ?? '',
      support_message: settings.support_message ?? '',
      contact_location: settings.contact_location ?? '',
      announcement_enabled: Boolean(settings.announcement_enabled),
      ad_enabled: Boolean(settings.ad_enabled),
      ad_title: settings.ad_title ?? '',
      ad_message: settings.ad_message ?? '',
      smtp_enabled: Boolean(settings.smtp_enabled),
      smtp_host: settings.smtp_host ?? '',
      smtp_port: settings.smtp_port ?? 587,
      smtp_username: settings.smtp_username ?? '',
      smtp_password: '',
      smtp_encryption: settings.smtp_encryption ?? 'tls',
      smtp_from_email: settings.smtp_from_email ?? '',
      smtp_from_name: settings.smtp_from_name ?? 'BridgeEdu Rwanda',
    })
  }, [settings])

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFeedback('')
    try {
      const { smtp_enabled, smtp_host, smtp_port, smtp_username, smtp_password, smtp_encryption, smtp_from_email, smtp_from_name, ...supportForm } = form
      const payload = { ...supportForm, announcement_text: '' }
      if (isSuperAdmin) {
        Object.assign(payload, { smtp_enabled, smtp_host, smtp_port, smtp_username, smtp_encryption, smtp_from_email, smtp_from_name })
        if (smtp_password) payload.smtp_password = smtp_password
      }
      await updateSettings(payload)
      setFeedback('Support and advertising settings saved.')
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to save settings.')
    }
  }

  const handleSmtpSubmit = async (event) => {
    event.preventDefault()
    setFeedback('')
    try {
      await updateSettings({ ...form, announcement_text: '' })
      setFeedback('SMTP settings saved. New mentor and newsletter notifications will use these settings.')
    } catch (error) {
      setFeedback(error?.response?.data?.message || 'Unable to save SMTP settings.')
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
            <label className="text-sm font-semibold text-slate-800">Contact location<input value={form.contact_location} onChange={(event) => updateField('contact_location', event.target.value)} placeholder="Huye, Rwanda" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800"><input type="checkbox" checked={form.announcement_enabled} onChange={(event) => updateField('announcement_enabled', event.target.checked)} /> Show live content ticker</label>
            <p className="text-sm text-slate-500">The ticker automatically lists all opportunity titles, pathways, and available mentorship.</p>
            <label className="text-sm font-semibold text-slate-800">Awareness ad title<input value={form.ad_title} onChange={(event) => updateField('ad_title', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-slate-800"><input type="checkbox" checked={form.ad_enabled} onChange={(event) => updateField('ad_enabled', event.target.checked)} /> Show awareness ad</label>
            <label className="text-sm font-semibold text-slate-800 md:col-span-2">Awareness ad message<textarea rows="3" value={form.ad_message} onChange={(event) => updateField('ad_message', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
            <button type="submit" disabled={isUpdating} className="w-fit rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">{isUpdating ? 'Saving...' : 'Save settings'}</button>
          </form>
          {isSuperAdmin ? (
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">SMTP email delivery</h2>
                  <p className="mt-1 text-sm text-slate-600">These settings control mentor application and newsletter notification emails.</p>
                </div>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${form.smtp_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {form.smtp_enabled ? 'SMTP enabled' : 'SMTP disabled'}
                </span>
              </div>
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Save valid SMTP credentials before enabling notifications. {settings.smtp_password_configured ? 'A password is already saved; leave the password field blank to keep it.' : 'No SMTP password is saved yet.'}</p>
              <form onSubmit={handleSmtpSubmit} className="mt-5 grid gap-5 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-800"><input type="checkbox" checked={form.smtp_enabled} onChange={(event) => updateField('smtp_enabled', event.target.checked)} /> Enable SMTP notifications</label>
                <label className="text-sm font-semibold text-slate-800">Encryption<select value={form.smtp_encryption} onChange={(event) => updateField('smtp_encryption', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"><option value="tls">TLS</option><option value="ssl">SSL</option><option value="none">None</option></select></label>
                <label className="text-sm font-semibold text-slate-800">SMTP host<input required={form.smtp_enabled} value={form.smtp_host} onChange={(event) => updateField('smtp_host', event.target.value)} placeholder="smtp.example.com" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-800">SMTP port<input required={form.smtp_enabled} type="number" min="1" max="65535" value={form.smtp_port} onChange={(event) => updateField('smtp_port', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-800">SMTP username<input value={form.smtp_username} onChange={(event) => updateField('smtp_username', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-800">SMTP password<input type="password" placeholder={settings.smtp_password_configured ? 'Saved password (leave blank to keep)' : 'SMTP password'} value={form.smtp_password} onChange={(event) => updateField('smtp_password', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-800">From email<input required={form.smtp_enabled} type="email" value={form.smtp_from_email} onChange={(event) => updateField('smtp_from_email', event.target.value)} placeholder="noreply@example.com" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                <label className="text-sm font-semibold text-slate-800">From name<input required={form.smtp_enabled} value={form.smtp_from_name} onChange={(event) => updateField('smtp_from_name', event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /></label>
                <button type="submit" disabled={isUpdating} className="w-fit rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">{isUpdating ? 'Saving SMTP...' : 'Save SMTP settings'}</button>
              </form>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}

export default AdminSupportPage
