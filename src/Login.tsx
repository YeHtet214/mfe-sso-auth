import { useEffect, useState, type FormEvent } from 'react'
import { login, getUser } from './api/auth'

interface FormState {
  email: string
  password: string
  remember: boolean
}

const initialState: FormState = {
  email: '',
  password: '',
  remember: false,
}

function Login() {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getUser()
        // If user is already logged in, handle redirect immediately
        const urlParams = new URLSearchParams(window.location.search)
        const redirectUrl = urlParams.get('redirect')
        if (redirectUrl) {
          window.location.replace(redirectUrl)
        } else {
          setSuccess('Already logged in.')
          setInitializing(false)
        }
      } catch (err) {
        // Not logged in, that's fine for the login page
        setInitializing(false)
      }
    }
    checkAuth()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.email || !form.password) {
      setError('Email and password are required.')
      return
    }

    setLoading(true)

    try {
      const response = await login(form)
      const userEmail = response.user?.email ?? form.email
      setSuccess(`Logged in as ${userEmail}.`)
      setForm((prev) => ({ ...prev, password: '' }))

      // Check for redirect URL in query parameters
      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect')

      if (redirectUrl) {
        // Redirect back to the original application
        window.location.replace(redirectUrl)
      }
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message)
      } else {
        setError('Unable to login right now.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (initializing) {
    return <p>Checking authentication...</p>
  }

  return (
    <section className="auth-card" aria-label="Login form">
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">Sign in to your Laravel API account.</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="auth-input"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          autoComplete="email"
        />

        <label className="auth-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="auth-input"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          autoComplete="current-password"
        />

        <label className="auth-checkbox-row" htmlFor="remember">
          <input
            id="remember"
            type="checkbox"
            checked={form.remember}
            onChange={(event) => setForm((prev) => ({ ...prev, remember: event.target.checked }))}
          />
          <span>Remember me</span>
        </label>

        {error ? <p className="auth-message auth-message-error">{error}</p> : null}
        {success ? <p className="auth-message auth-message-success">{success}</p> : null}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </section>
  )
}

export default Login
