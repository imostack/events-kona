import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  variant?: "default" | "gradient"
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  variant = "default"
}: PageHeaderProps) {
  if (variant === "gradient") {
    return (
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto text-center">
          {Icon && (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Icon className="text-primary" size={32} />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
          {description && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </section>
    )
  }

  // Default variant - minimal/clean
  return (
    <section className="bg-card border-b border-border py-12 px-4">
      <div className="max-w-6xl mx-auto text-center">
        {Icon && (
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Icon className="text-primary" size={32} />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{title}</h1>
        {description && (
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </section>
  )
}
