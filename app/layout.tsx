import type React from "react";
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";

import "./globals.css";
import { AuthProvider } from "@/lib/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EventsKona - Discover & Create Events",
  description: "Discover, create, and manage amazing events with EventsKona",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}