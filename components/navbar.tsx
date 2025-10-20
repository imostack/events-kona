"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Calendar } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
            <Link href="/" className="text-foreground hover:text-primary transition-colors font-semibold">
              Home
            </Link>
            <Link href="/my-events" className="text-foreground hover:text-primary transition-colors font-semibold">
              My Events
            </Link>
            <Link href="/create-event" className="text-foreground hover:text-primary transition-colors font-semibold">
              Create Event
            </Link>
            <Link href="/login">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Sign In
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-foreground hover:text-primary">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 space-y-3 pb-4">
            <Link href="/">
              <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">Home</div>
            </Link>
            <Link href="/my-events">
              <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">
                My Events
              </div>
            </Link>
            <Link href="/create-event">
              <div className="block text-foreground hover:text-primary transition-colors font-semibold py-2">
                Create Event
              </div>
            </Link>
            <Link href="/login">
              <button className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                Sign In
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
