import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { getLockoutEnd, recordFailedLogin, resetFailedLogins } from '../utils/adminAuth'
import { supabase } from '../lib/supabase'

const OWNER_EMAIL = 'holycrowbakery@gmail.com'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const lockoutEnd = getLockoutEnd()
    if (lockoutEnd) {
      const minutes = Math.max(1, Math.ceil((lockoutEnd - Date.now()) / 60000))
      setError(`Too many attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`)
      return
    }

    setSubmitting(true)
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: OWNER_EMAIL, password })
      if (!loginError) {
        resetFailedLogins()
        navigate('/admin/orders')
        return
      }
      const result = recordFailedLogin()
      setPassword('')
      setError(result.lockedUntil ? 'Too many attempts. Login is locked for 15 minutes.' : `Incorrect password. ${result.remaining} attempt${result.remaining === 1 ? '' : 's'} remaining.`)
    } catch {
      setError('Secure login is unavailable on this connection. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordResetRequest = async () => {
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(OWNER_EMAIL, {
        redirectTo: new URL(`${import.meta.env.BASE_URL}admin/reset`, window.location.origin).href,
      })
      if (resetError) throw resetError
      setError('Password reset email sent to the owner inbox.')
    } catch (resetError) {
      const message = resetError instanceof Error ? resetError.message : 'Unable to send a password reset email.'
      setError(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#0e0c08' }}>
      {/* Floating decorations */}
      <div className="absolute top-1/4 right-1/4 text-[#d094ad] opacity-20 text-4xl">✦</div>
      <div className="absolute bottom-1/3 left-1/4 text-[#d094ad] opacity-15 text-2xl">☽</div>

      <div className="w-full max-w-sm mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <p className="text-xl tracking-widest text-[#fcf6e8]" style={{ fontFamily: 'Cinzel Decorative, serif' }}>
              Holy Crow Bakery
            </p>
          </Link>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(208,148,173,0.15)', border: '1px solid rgba(208,148,173,0.3)' }}>
            <Lock size={20} style={{ color: '#d094ad' }} />
          </div>
          <h1 className="text-2xl text-[#fcf6e8]" style={{ fontFamily: 'Cinzel, serif' }}>Owner Access</h1>
          <p className="text-xs text-[#fcf6e8] opacity-40 mt-2" style={{ fontFamily: 'Nunito, sans-serif' }}>
            This area is restricted to the bakery owner.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-2xl space-y-5"
          style={{ backgroundColor: '#1a1e1f', border: '1px solid rgba(208,148,173,0.2)' }}
        >
          <div>
            <label className="block text-xs tracking-widest uppercase mb-2 text-[#d094ad]"
              style={{ fontFamily: 'Cinzel, serif' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-[#d094ad]/50"
                style={{
                  backgroundColor: '#0e0c08',
                  border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(208,148,173,0.2)'}`,
                  color: '#fcf6e8',
                  fontFamily: 'Nunito, sans-serif',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-70 transition-opacity"
                style={{ color: '#fcf6e8' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && (
              <p className="text-xs mt-1.5" style={{ color: 'rgba(239,68,68,0.8)', fontFamily: 'Nunito, sans-serif' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full py-3 rounded-full font-semibold text-sm tracking-widest uppercase transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
          >
            {submitting ? 'Checking…' : 'Enter ✦'}
          </button>

          <button
            type="button"
            onClick={() => void handlePasswordResetRequest()}
            className="mt-3 block w-full text-center text-[9px] uppercase tracking-[0.18em] opacity-60 transition-opacity hover:opacity-100"
            style={{ color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
          >
            Forgot/Change Password
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-xs text-[#fcf6e8] opacity-30 hover:opacity-50 transition-opacity"
            style={{ fontFamily: 'Nunito, sans-serif' }}>
            ← Back to Holy Crow Bakery
          </Link>
        </div>
      </div>
    </div>
  )
}
