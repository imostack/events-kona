"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, Calendar, LogOut, Settings, PlusCircle, ShoppingBag } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src="https://res.cloudinary.com/dlcl5rqnh/image/upload/v1767946902/EK_300x_kystpx.webp"
                alt="EventsKona Logo"
                className="h-10 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-semibold">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/my-events" className="text-foreground hover:text-primary transition-colors font-semibold">
                  My Events
                </Link>
                <Link href="/orders" className="text-foreground hover:text-primary transition-colors font-semibold">
                  Orders
                </Link>
                <Link
                  href="/create-event"
                  className="text-foreground hover:text-primary transition-colors font-semibold"
                >
                  Create Event
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg hover:bg-primary/20 transition-colors font-semibold"
                >
                  {user?.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.name || "User"} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span>{user?.name || "User"}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    
                    <Link href="/my-events" onClick={() => setShowUserMenu(false)}>
                      <div className="px-4 py-2 hover:bg-muted transition-colors cursor-pointer flex items-center gap-3">
                        <Calendar size={18} className="text-muted-foreground" />
                        <span className="text-sm font-medium">My Events</span>
                      </div>
                    </Link>
                    <Link href="/orders" onClick={() => setShowUserMenu(false)}>
                      <div className="px-4 py-2 hover:bg-muted transition-colors cursor-pointer flex items-center gap-3">
                        <ShoppingBag size={18} className="text-muted-foreground" />
                        <span className="text-sm font-medium">My Orders</span>
                      </div>
                    </Link>
                    <Link href="/create-event" onClick={() => setShowUserMenu(false)}>
                      <div className="px-4 py-2 hover:bg-muted transition-colors cursor-pointer flex items-center gap-3">
                        <PlusCircle size={18} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Create Event</span>
                      </div>
                    </Link>
                    <Link href="/settings" onClick={() => setShowUserMenu(false)}>
                      <div className="px-4 py-2 hover:bg-muted transition-colors cursor-pointer flex items-center gap-3">
                        <Settings size={18} className="text-muted-foreground" />
                        <span className="text-sm font-medium">Account Settings</span>
                      </div>
                    </Link>
                    <div className="border-t border-border mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 hover:bg-muted transition-colors text-left flex items-center gap-3 text-destructive"
                      >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-foreground hover:text-primary transition-colors font-semibold">
                  Sign In
                </Link>
                <Link href="/signup">
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                    Get Started
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground hover:text-primary">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4">
            {isAuthenticated && user && (
              <div className="px-4 py-3 bg-muted rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt={user.name || "User"} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            <Link href="/" onClick={() => setIsOpen(false)}>
              <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">Home</div>
            </Link>

            {isAuthenticated ? (
              <>
                
                <Link href="/my-events" onClick={() => setIsOpen(false)}>
                  <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">
                    My Events
                  </div>
                </Link>
                <Link href="/orders" onClick={() => setIsOpen(false)}>
                  <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">
                    My Orders
                  </div>
                </Link>
                <Link href="/create-event" onClick={() => setIsOpen(false)}>
                  <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">
                    Create Event
                  </div>
                </Link>
                <Link href="/settings" onClick={() => setIsOpen(false)}>
                  <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">
                   General Settings
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full text-left text-destructive hover:text-destructive/80 transition-colors font-semibold py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-muted text-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition-colors font-semibold">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
