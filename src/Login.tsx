import { useEffect, useState, type FormEvent } from 'react'
import { login, getUser, logout, type User } from './api/auth'
import { createSsoToken, redirectWithToken, redirectToOrigin } from './api/sso'
import { setToken, removeToken } from './api/axios'

interface FormState {
  email: string
  password: string
}

const initialState: FormState = {
  email: '',
  password: '',
}

function Login() {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [initializing, setInitializing] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [redirectUri, setRedirectUri] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getUser()
        setUser(userData)
        
        const urlParams = new URLSearchParams(window.location.search)
        const clientIdParam = urlParams.get('client_id')
        const redirect = urlParams.get('redirect_uri')
        setRedirectUri(redirect)
        setClientId(clientIdParam)
        
        if (clientIdParam && redirect) {
          try {
            const tokenData = await createSsoToken(clientIdParam, redirect)
            redirectWithToken(redirect, tokenData.access_token)
          } catch {
            setInitializing(false)
          }
        } else {
          setInitializing(false)
        }
      } catch {
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
      if (response.token) {
        setToken(response.token)
      }
      setUser(response.user ?? null)
      setSuccess('Logged in successfully.')
      setForm((prev) => ({ ...prev, password: '' }))

      const urlParams = new URLSearchParams(window.location.search)
      const clientId = urlParams.get('client_id')
      const redirect = urlParams.get('redirect_uri')

      if (clientId && redirect) {
        try {
          const tokenData = await createSsoToken(clientId, redirect)
          redirectWithToken(redirect, tokenData.access_token)
        } catch {
          // Auto-redirect failed, user can use manual button
        }
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

  const handleLogout = async () => {
    try {
      await logout()
      removeToken()
      setUser(null)
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect_uri')
      if (redirect) {
        window.location.href = redirect
      } else {
        window.location.reload()
      }
    } catch {
      setError('Logout failed.')
    }
  }

  if (initializing) {
    return <p>Checking authentication...</p>
  }

  // User is logged in - show welcome screen
  if (user) {
    return (
      <section className="auth-card">
        <h1 className="auth-title">Welcome</h1>
        <p className="auth-subtitle">Logged in as {user.email}</p>
        <div className="auth-button-group">
          {redirectUri && clientId && (
            <button
              className="auth-submit"
              onClick={() => redirectToOrigin(redirectUri, clientId)}
            >
              Return to App
            </button>
          )}
          <button className="auth-submit auth-submit-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>
    )
  }

  // User is not logged in - show login form
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

        {error ? <p className="auth-message auth-message-error">{error}</p> : null}
        {success ? (
          <div className="auth-success-section">
            <p className="auth-message auth-message-success">{success}</p>
            {redirectUri && clientId && (
              <button
                type="button"
                className="auth-submit"
                onClick={() => redirectToOrigin(redirectUri, clientId)}
              >
                Return to App
              </button>
            )}
          </div>
        ) : null}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </section>
  )
}

export default Login
