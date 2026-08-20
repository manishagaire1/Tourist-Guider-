import { createContext, useEffect, useState, type ReactNode } from 'react'
import * as authService from '@/services/authService'
import { getStoredTokens } from '@/services/apiClient'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (payload: authService.RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const tokens = getStoredTokens()
    if (!tokens) {
      setIsLoading(false)
      return
    }
    authService
      .fetchProfile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const loggedInUser = await authService.login(username, password)
    setUser(loggedInUser)
  }

  async function register(payload: authService.RegisterPayload) {
    await authService.register(payload)
    await login(payload.username, payload.password)
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
