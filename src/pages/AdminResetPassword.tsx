import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AdminResetPassword() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession()
      setReady(Boolean(data.session))
      if (!data.session) {
        const hash = window.location.hash
        const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (!sessionError) {
            const { data: nextSession } = await supabase.auth.getSession()
            setReady(Boolean(nextSession.session))
          }
        }
      }
    }

    void checkRecoverySession()
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      await supabase.auth.signOut()
      navigate('/admin')
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Unable to update password.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0e0c08' }}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ backgroundColor: '#1a1e1f', borderColor: 'rgba(208,148,173,0.2)' }}>
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#d094ad]" style={{ fontFamily: 'Cinzel, serif' }}>
          Reset Password
        </p>
        <h1 className="mb-5 text-2xl text-[#fcf6e8]" style={{ fontFamily: 'Cinzel, serif' }}>
          New owner password
        </h1>

        {!ready ? (
          <p className="text-sm text-[#fcf6e8] opacity-70" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Loading your secure reset link...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              autoComplete="new-password"
              spellCheck={false}
              className="w-full rounded-xl border px-4 py-3 text-sm text-[#fcf6e8] outline-none focus:ring-2 focus:ring-[#d094ad]/50"
              style={{ backgroundColor: '#0e0c08', borderColor: 'rgba(208,148,173,0.2)', fontFamily: 'Nunito, sans-serif' }}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              autoComplete="new-password"
              spellCheck={false}
              className="w-full rounded-xl border px-4 py-3 text-sm text-[#fcf6e8] outline-none focus:ring-2 focus:ring-[#d094ad]/50"
              style={{ backgroundColor: '#0e0c08', borderColor: 'rgba(208,148,173,0.2)', fontFamily: 'Nunito, sans-serif' }}
            />

            {error && (
              <p className="text-xs" style={{ color: '#ff9999', fontFamily: 'Nunito, sans-serif' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !ready}
              className="w-full rounded-full px-4 py-3 text-sm tracking-[0.15em] uppercase transition-all disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#d094ad', color: '#fcf6e8', fontFamily: 'Cinzel, serif' }}
            >
              {submitting ? 'Saving…' : 'Save Password'}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#fcf6e8] opacity-60 transition-opacity hover:opacity-100"
          style={{ fontFamily: 'Cinzel, serif' }}
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
