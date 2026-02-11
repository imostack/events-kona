"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { apiClient, setTokens, clearTokens, getAccessToken, getRefreshToken } from "./api-client"

// =====================
// Types
// =====================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string // computed convenience field
  avatarUrl: string | null
  role: string
  emailVerified: boolean
  organizerName: string | null
  organizerSlug: string | null
}

interface LoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    avatarUrl: string | null
    emailVerified: boolean
    organizerName: string | null
    organizerSlug: string | null
  }
  accessToken: string
  refreshToken: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  forgotPassword: (email: string) => Promise<string>
  resetPassword: (token: string, password: string) => Promise<string>
}

// =====================
// Helpers
// =====================

function mapApiUser(apiUser: Record<string, unknown>): User {
  const firstName = (apiUser.firstName as string) || ""
  const lastName = (apiUser.lastName as string) || ""
  return {
    id: apiUser.id as string,
    email: apiUser.email as string,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || (apiUser.email as string).split("@")[0],
    avatarUrl: (apiUser.avatarUrl as string) || null,
    role: (apiUser.role as string) || "USER",
    emailVerified: (apiUser.emailVerified as boolean) ?? false,
    organizerName: (apiUser.organizerName as string) || null,
    organizerSlug: (apiUser.organizerSlug as string) || null,
  }
}

// Parse JWT exp claim for refresh timer
function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    if (payload.exp) return payload.exp * 1000
  } catch { /* invalid token */ }
  return null
}

// =====================
// Context
// =====================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const scheduleRefresh = useCallback(() => {
    clearRefreshTimer()

    const token = getAccessToken()
    if (!token) return

    const expiryMs = getTokenExpiryMs(token)
    if (!expiryMs) return

    // Refresh 1 minute before expiry
    const delay = expiryMs - Date.now() - 60_000
    if (delay <= 0) return

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const data = await apiClient<{ accessToken: string; refreshToken: string }>("/api/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refreshToken: getRefreshToken() }),
          skipAuth: true,
        })
        setTokens(data.accessToken, data.refreshToken)
        scheduleRefresh()
      } catch {
        // Refresh failed - user will need to re-login on next 401
      }
    }, delay)
  }, [clearRefreshTimer])

  // Session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const data = await apiClient<Record<string, unknown>>("/api/auth/me")
        setUser(mapApiUser(data))
        scheduleRefresh()
      } catch {
        clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()

    return () => clearRefreshTimer()
  }, [scheduleRefresh, clearRefreshTimer])

  const login = async (email: string, password: string) => {
    const data = await apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    })

    setTokens(data.accessToken, data.refreshToken)
    setUser(mapApiUser(data.user as unknown as Record<string, unknown>))
    scheduleRefresh()
  }

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    const data = await apiClient<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName }),
      skipAuth: true,
    })

    // Auto-login after signup (email verification skipped for now)
    setTokens(data.accessToken, data.refreshToken)
    setUser(mapApiUser(data.user as unknown as Record<string, unknown>))
    scheduleRefresh()
  }

  const logout = async () => {
    try {
      await apiClient("/api/auth/logout", { method: "POST" })
    } catch {
      // Clear local state even if API call fails
    }
    clearRefreshTimer()
    clearTokens()
    setUser(null)
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const forgotPassword = async (email: string): Promise<string> => {
    await apiClient("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    })
    return "If an account exists with this email, a password reset link has been sent."
  }

  const resetPassword = async (token: string, password: string): Promise<string> => {
    await apiClient("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    })
    return "Password has been reset successfully. Please log in with your new password."
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
