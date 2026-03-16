import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/components/providers/AuthProvider'

export default function Login() {
  const { user, signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Already logged in — redirect to dashboard
  if (user && !loading) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message
      )
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-green">Aaron's Lawn Care</h1>
          <p className="text-gray-500 mt-1">Business Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-green-200 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 bg-green-50/50 border border-green-200 rounded-md shadow-[inset_0_1px_4px_rgba(45,80,22,0.12)] focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 bg-green-50/50 border border-green-200 rounded-md shadow-[inset_0_1px_4px_rgba(45,80,22,0.12)] focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-green text-white py-2 px-4 rounded-md font-medium hover:bg-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Staff access only
        </p>
      </div>
    </div>
  )
}
