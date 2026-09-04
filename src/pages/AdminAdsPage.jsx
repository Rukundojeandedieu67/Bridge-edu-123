import { useState } from 'react'
import AdminNavigation from '../components/AdminNavigation.jsx'
import { useAds } from '../hooks/useAds.js'

const emptyForm = { title: '', message: '', link: '', is_active: true }

function AdminAdsPage() {
  const { ads, isLoading, isError, createAd, updateAd, deleteAd, isSaving } = useAds({ manage: true })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [feedback, setFeedback] = useState('')
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const reset = () => { setForm(emptyForm); setEditingId(null) }

  const submit = async (event) => {
    event.preventDefault()
    setFeedback('')
    try {
      if (editingId) await updateAd({ id: editingId, data: form })
      else await createAd(form)
      setFeedback(editingId ? 'Advertisement updated.' : 'Advertisement created.')
      reset()
    } catch (error) { setFeedback(error?.response?.data?.message || 'Unable to save advertisement.') }
  }

  const edit = (ad) => { setEditingId(ad.id); setForm({ title: ad.title, message: ad.message, link: ad.link || '', is_active: Boolean(ad.is_active) }) }

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <AdminNavigation />
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Platform promotion</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Advertisements</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Create, edit, publish, or remove messages shown to every platform visitor.</p>
          {feedback ? <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">{feedback}</p> : null}
          <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
            <input required value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Advertisement title" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="url" value={form.link} onChange={(event) => updateField('link', event.target.value)} placeholder="Optional link: https://..." className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <textarea required rows="3" value={form.message} onChange={(event) => updateField('message', event.target.value)} placeholder="Advertisement message" className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => updateField('is_active', event.target.checked)} /> Publish this advertisement</label>
            <div className="flex gap-2"><button type="submit" disabled={isSaving} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60">{isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create advertisement'}</button>{editingId ? <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button> : null}</div>
          </form>
          {isError ? <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">Unable to load advertisements.</p> : null}
          {!isLoading && !isError ? <div className="mt-6 grid gap-4 md:grid-cols-2">{ads.map((ad) => <article key={ad.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{ad.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{ad.message}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${ad.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{ad.is_active ? 'Published' : 'Draft'}</span></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => edit(ad)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700">Edit</button><button type="button" onClick={async () => { if (window.confirm(`Delete ${ad.title}?`)) await deleteAd(ad.id) }} className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-semibold text-rose-700">Delete</button></div></article>)}</div> : null}
        </section>
      </div>
    </main>
  )
}

export default AdminAdsPage