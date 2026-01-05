"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  hasCompletedOnboarding?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("eventskona_user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("[v0] Failed to parse saved user:", error)
        localStorage.removeItem("eventskona_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Mock user - in production this will call your backend API
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0],
      hasCompletedOnboarding: true, // Existing users have completed onboarding
    }
    
    setUser(mockUser)
    localStorage.setItem("eventskona_user", JSON.stringify(mockUser))
  }

  const signup = async (email: string, password: string, name: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Mock user - in production this will call your backend API
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      hasCompletedOnboarding: false, // New users need to complete onboarding
    }
    
    setUser(mockUser)
    localStorage.setItem("eventskona_user", JSON.stringify(mockUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("eventskona_user")
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("eventskona_user", JSON.stringify(updatedUser))
    }
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