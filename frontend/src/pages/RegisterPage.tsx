import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'

function RegisterPage() {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field: keyof typeof form) {
    return (event: ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (form.password !== form.password2) {
      setError(t('auth.passwordsDontMatch'))
      return
    }

    setIsSubmitting(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      const detail = (err as { response?: { data?: Record<string, string[]> } })?.response?.data
      const firstError = detail ? Object.values(detail).flat()[0] : undefined
      setError(firstError ?? t('auth.registrationFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-neutral-900">{t('auth.createAccount')}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t('auth.registerSubtitle')}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('auth.username')}
            <input
              type="text"
              required
              value={form.username}
              onChange={updateField('username')}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('auth.email')}
            <input
              type="email"
              required
              value={form.email}
              onChange={updateField('email')}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('auth.password')}
            <input
              type="password"
              required
              value={form.password}
              onChange={updateField('password')}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            {t('auth.confirmPassword')}
            <input
              type="password"
              required
              value={form.password2}
              onChange={updateField('password2')}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-primary-400"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-pill bg-accent-500 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:opacity-60"
          >
            {isSubmitting ? t('auth.creatingAccount') : t('auth.register')}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-medium text-accent-600 hover:underline">
            {t('auth.logInLink')}
          </Link>
        </p>
      </div>
    </main>
  )
}

export default RegisterPage
