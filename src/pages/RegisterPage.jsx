import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import FormError from '../components/FormError.jsx'
import FormInput from '../components/FormInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const registerSchema = z
  .object({
    full_name: z.string().min(1, 'Full name is required.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    password_confirmation: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  })

function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = async (values) => {
    setSubmitError('')

    try {
      const payload = await registerUser(values)
      navigate('/opportunities')
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to create your account. Please try again.'
      setSubmitError(message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Create account</h1>
          <p className="mt-2 text-sm text-slate-600">Create your student account to access BridgeEdu opportunities.</p>
        </div>

        <FormError message={submitError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Full name"
            name="full_name"
            placeholder="Your full name"
            autoComplete="name"
            register={register}
            error={errors.full_name?.message}
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            register={register}
            error={errors.email?.message}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            register={register}
            error={errors.password?.message}
          />

          <FormInput
            label="Confirm password"
            name="password_confirmation"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            register={register}
            error={errors.password_confirmation?.message}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Login
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
