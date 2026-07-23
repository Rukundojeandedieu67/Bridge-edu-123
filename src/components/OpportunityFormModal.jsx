import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Modal from './Modal.jsx'

const opportunitySchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  category: z.enum(['scholarship', 'bootcamp', 'micro_task', 'grant']),
  description: z.string().min(1, 'Description is required.'),
  provider_name: z.string().min(1, 'Provider name is required.'),
  eligibility_criteria: z.string().optional().or(z.literal('')),
  application_deadline: z.string().optional().or(z.literal('')),
  external_link: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  region_tags: z.string().optional(),
})

function OpportunityFormModal({ isOpen, mode, initialData, onClose, onSubmit }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: '',
      category: 'scholarship',
      description: '',
      provider_name: '',
      eligibility_criteria: '',
      application_deadline: '',
      external_link: '',
      region_tags: '',
    },
  })

  useEffect(() => {
    if (!isOpen) {
      return
    }

    reset({
      title: initialData?.title ?? '',
      category: initialData?.category ?? 'scholarship',
      description: initialData?.description ?? '',
      provider_name: initialData?.provider_name ?? '',
      eligibility_criteria: initialData?.eligibility_criteria ?? '',
      application_deadline: initialData?.application_deadline ?? '',
      external_link: initialData?.external_link ?? '',
      region_tags: initialData?.region_tags?.join(', ') ?? '',
    })
  }, [isOpen, initialData, reset])

  if (!isOpen) {
    return null
  }

  const submitForm = async (values) => {
    const payload = {
      ...values,
      eligibility_criteria: values.eligibility_criteria || null,
      application_deadline: values.application_deadline || null,
      external_link: values.external_link || null,
      region_tags: values.region_tags
        ? values.region_tags
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    }

    await onSubmit(payload)
    onClose()
  }

  return (
    <Modal title={mode === 'edit' ? 'Edit opportunity' : 'Add opportunity'} onClose={onClose}>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block space-y-1 text-sm font-medium text-slate-700 lg:col-span-2">
            <span>Title</span>
            <input {...register('title')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.title ? <span className="text-xs text-rose-600">{errors.title.message}</span> : null}
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Category</span>
            <select {...register('category')} className="w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="scholarship">scholarship</option>
              <option value="bootcamp">bootcamp</option>
              <option value="micro_task">micro_task</option>
              <option value="grant">grant</option>
            </select>
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Provider</span>
            <input {...register('provider_name')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.provider_name ? <span className="text-xs text-rose-600">{errors.provider_name.message}</span> : null}
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700 lg:col-span-2">
            <span>Description</span>
            <textarea {...register('description')} rows="4" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.description ? <span className="text-xs text-rose-600">{errors.description.message}</span> : null}
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700 lg:col-span-2">
            <span>Eligibility criteria</span>
            <textarea {...register('eligibility_criteria')} rows="3" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>Application deadline</span>
            <input type="datetime-local" {...register('application_deadline')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700">
            <span>External link</span>
            <input type="url" {...register('external_link')} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            {errors.external_link ? <span className="text-xs text-rose-600">{errors.external_link.message}</span> : null}
          </label>

          <label className="block space-y-1 text-sm font-medium text-slate-700 lg:col-span-2">
            <span>Region tags</span>
            <input {...register('region_tags')} placeholder="e.g. Kigali, East" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 sm:w-auto">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto">
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update opportunity' : 'Create opportunity'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default OpportunityFormModal
