"use client"

import Link from "next/link"
import { Facebook, Instagram, Linkedin } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function Footer() {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear() // Auto-updates every year!

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">EventsKona</h3>
            <p className="text-muted-foreground text-sm">
              Discover, create, and manage amazing events in your community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={user ? "/my-events" : "/signup"}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  My Events
                </Link>
              </li>
              <li>
                <Link
                  href={user ? "/create-event" : "/signup"}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Create Event
                </Link>
              </li>
              <li>
                <Link
                  href={user ? "/login" : "/login"}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {user ? "Sign Out" : "Sign In"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-primary transition-colors">
                  Guides
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link href="https://instagram.com/eventskona" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} EventsKona. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-sm items-center">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookie-policy" className="text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
            <span className="text-muted-foreground">|</span>
            <a
              href="https://www.freepik.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Hero images by Freepik
            </a>
            <span className="text-muted-foreground">|</span>
            <a
              href="https://appguts.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Powered by <span className="font-semibold">App Guts Limited</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}