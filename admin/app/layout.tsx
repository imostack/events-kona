import "@/app/globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AdminAuthProvider } from "@/lib/admin-auth-context";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata = {
  title: "Admin Dashboard - EventsKona",
  description: "Administrative dashboard for EventsKona platform management",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="overflow-x-hidden">
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
