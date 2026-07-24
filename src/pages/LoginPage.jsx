import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import FormError from '../components/FormError.jsx'
import FormInput from '../components/FormInput.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    setSubmitError('')

    try {
      const payload = await login(values)
      const role = payload?.user?.role || 'student'
      navigate(role === 'admin' ? '/admin' : '/opportunities')
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to sign in. Please try again.'
      setSubmitError(message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">BridgeEdu Rwanda</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">Access opportunities, pathways, and mentorship tools.</p>
        </div>

        <FormError message={submitError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Enter your password"
            autoComplete="current-password"
            register={register}
            error={errors.password?.message}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
            Register
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
