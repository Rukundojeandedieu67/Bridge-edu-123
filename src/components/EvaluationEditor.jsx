import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLessonEvaluation, getAdminLessonEvaluation, updateLessonEvaluation } from '../api/learning.js'

function EvaluationEditor({ step }) {
  const queryClient = useQueryClient()
  const evaluationQuery = useQuery({ queryKey: ['admin-lesson-evaluation', step.id], queryFn: () => getAdminLessonEvaluation(step.id) })
  const existing = evaluationQuery.data?.data?.[0]
  const [form, setForm] = useState({ question: '', options: '', correct_option: '', unlock_minutes: '0', points: '5' })

  useEffect(() => {
    if (existing) {
      setForm({
        question: existing.question,
        options: existing.options.join(', '),
        correct_option: existing.options[0] || '',
        unlock_minutes: String(Math.floor((existing.unlock_at_seconds || 0) / 60)),
        points: String(existing.points || 5),
      })
    }
  }, [existing])

  const saveMutation = useMutation({
    mutationFn: () => {
      const options = form.options.split(',').map((option) => option.trim()).filter(Boolean)
      const payload = {
        position: existing?.position || 1,
        question: form.question.trim(),
        options,
        correct_option: form.correct_option.trim(),
        unlock_at_seconds: Number(form.unlock_minutes) * 60,
        points: Number(form.points),
      }
      return existing ? updateLessonEvaluation(existing.id, payload) : createLessonEvaluation(step.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-evaluation', step.id] })
      queryClient.invalidateQueries({ queryKey: ['lesson-evaluation', step.id] })
    },
  })

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  return (
    <form onSubmit={(event) => { event.preventDefault(); saveMutation.mutate() }} className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
      <p className="bridge-kicker text-violet-800">COURSE AUTHORING</p>
      <h4 className="mt-1 font-semibold text-slate-950">Unit checkpoint</h4>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input required value={form.question} onChange={(event) => updateField('question', event.target.value)} placeholder="Question learners answer" className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm md:col-span-2" />
        <input required value={form.options} onChange={(event) => updateField('options', event.target.value)} placeholder="Answers, separated by commas" className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm" />
        <input required value={form.correct_option} onChange={(event) => updateField('correct_option', event.target.value)} placeholder="Correct answer exactly" className="rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm" />
        <label className="text-xs font-semibold text-violet-900">Unlock at minute
          <input required type="number" min="0" value={form.unlock_minutes} onChange={(event) => updateField('unlock_minutes', event.target.value)} className="mt-1 block w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-violet-900">Points
          <input required type="number" min="1" value={form.points} onChange={(event) => updateField('points', event.target.value)} className="mt-1 block w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm" />
        </label>
      </div>
      <button type="submit" disabled={saveMutation.isPending} className="mt-3 rounded-full bg-violet-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
        {saveMutation.isPending ? 'Saving...' : existing ? 'Update checkpoint' : 'Add checkpoint'}
      </button>
      {saveMutation.isError ? <p className="mt-2 text-xs font-semibold text-rose-700">{saveMutation.error?.response?.data?.message || 'Could not save checkpoint.'}</p> : null}
    </form>
  )
}

export default EvaluationEditor