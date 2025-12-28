"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { Menu, X, Calendar, User, LogOut } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  // 🔐 Mock auth state (replace later with Supabase)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpenProfile(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Calendar size={24} />
              </div>
              <span className="text-2xl font-bold text-foreground">EventsKona</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-semibold hover:text-primary">
              Home
            </Link>
            <Link href="/my-events" className="font-semibold hover:text-primary">
              My Events
            </Link>
            <Link href="/create-event" className="font-semibold hover:text-primary">
              Create Event
            </Link>

            {!isAuthenticated ? (
              <Link href="/login">
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90">
                  Sign In
                </button>
              </Link>
            ) : (
              <div className="relative" ref={profileRef}>
                {/* Avatar */}
                <button
                  onClick={() => setOpenProfile(!openProfile)}
                  className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold"
                >
                  EK
                </button>

                {/* Dropdown */}
                {openProfile && (
                  <div className="absolute right-0 mt-3 w-44 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsAuthenticated(false)
                        setOpenProfile(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-sm text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4">
            <Link href="/" className="block py-2 font-semibold">
              Home
            </Link>
            <Link href="/my-events" className="block py-2 font-semibold">
              My Events
            </Link>
            <Link href="/create-event" className="block py-2 font-semibold">
              Create Event
            </Link>

            {!isAuthenticated ? (
              <Link href="/login">
                <button className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold">
                  Sign In
                </button>
              </Link>
            ) : (
              <>
                <Link href="/profile" className="block py-2 font-semibold">
                  Profile
                </Link>
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="w-full bg-muted px-6 py-2 rounded-lg font-semibold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 🔧 TEMP: simulate login (remove later) */}
      <div className="text-center py-2">
        <button
          onClick={() => setIsAuthenticated(true)}
          className="text-xs text-muted-foreground underline"
        >
          Simulate Login
        </button>
      </div>
    </nav>
  )
}