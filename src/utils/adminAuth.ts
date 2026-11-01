const ATTEMPT_KEY = 'bakery_login_attempts'
const LOCKOUT_DURATION_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

type AttemptState = {
  count: number
  lastAttempt: number
  lockedUntil: number
}

const readAttempts = (): AttemptState => {
  try {
    const stored = localStorage.getItem(ATTEMPT_KEY)
    if (!stored) return { count: 0, lastAttempt: 0, lockedUntil: 0 }
    return JSON.parse(stored) as AttemptState
  } catch {
    return { count: 0, lastAttempt: 0, lockedUntil: 0 }
  }
}

export const getLockoutEnd = () => {
  const state = readAttempts()
  return state.lockedUntil > Date.now() ? state.lockedUntil : 0
}

export const recordFailedLogin = () => {
  const now = Date.now()
  const previous = readAttempts()
  const recentCount = now - previous.lastAttempt < LOCKOUT_DURATION_MS ? previous.count : 0
  const count = recentCount + 1
  const lockedUntil = count >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION_MS : 0
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify({ count: lockedUntil ? 0 : count, lastAttempt: now, lockedUntil }))
  return { remaining: Math.max(0, MAX_ATTEMPTS - count), lockedUntil }
}

export const resetFailedLogins = () => localStorage.removeItem(ATTEMPT_KEY)
