import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

// Generic shimmer block
function Shimmer({ className }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded ${className ?? ""}`} />
}

// Full-page skeleton with Navbar + shimmer content
export function PageSkeleton({ variant = "default" }: { variant?: "default" | "detail" | "settings" | "list" }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {variant === "detail" && <DetailSkeleton />}
          {variant === "settings" && <SettingsSkeleton />}
          {variant === "list" && <ListSkeleton />}
          {variant === "default" && <DefaultSkeleton />}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function DefaultSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Shimmer className="h-8 w-48" />
      <Shimmer className="h-4 w-72" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Shimmer key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Shimmer className="h-6 w-32" />
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-8 w-2/3" />
        <Shimmer className="h-4 w-1/3" />
      </div>
      {/* Cover image */}
      <Shimmer className="h-56 w-full" />
      {/* Content blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Shimmer className="h-5 w-full" />
          <Shimmer className="h-5 w-5/6" />
          <Shimmer className="h-5 w-4/5" />
          <Shimmer className="h-5 w-full" />
          <Shimmer className="h-5 w-3/4" />
        </div>
        <div className="space-y-4">
          <Shimmer className="h-36" />
          <Shimmer className="h-12" />
          <Shimmer className="h-12" />
        </div>
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Shimmer className="h-8 w-48" />
        <Shimmer className="h-4 w-64" />
      </div>
      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="h-9 w-24" />
        ))}
      </div>
      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <Shimmer className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Shimmer className="h-5 w-36" />
          <Shimmer className="h-4 w-48" />
        </div>
      </div>
      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Shimmer className="h-4 w-24" />
            <Shimmer className="h-11" />
          </div>
        ))}
      </div>
      <Shimmer className="h-11 w-32" />
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      <Shimmer className="h-8 w-40" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Shimmer className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-5 w-3/4" />
              <Shimmer className="h-4 w-1/2" />
            </div>
            <Shimmer className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Inline form skeleton — use inside tab content while data loads
export function FormSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-5 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-4 bg-muted rounded w-28" />
          <div className="h-11 bg-muted rounded" />
        </div>
      ))}
      <div className="h-11 bg-muted rounded w-32" />
    </div>
  )
}
