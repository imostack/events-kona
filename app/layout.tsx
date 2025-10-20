import type React from "react";
import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";

import "./globals.css";

export const metadata: Metadata = {
  title: "EventsKona - Discover & Create Events",
  description: "Discover, create, and manage amazing events with EventsKona",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}
    >
      <body>{children}</body>
    </html>
  );
}
