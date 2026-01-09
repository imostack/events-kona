import type { Metadata } from "next"

export const siteConfig = {
  name: "EventsKona",
  description: "Discover, create, and manage amazing events in Nigeria, Ghana, and across Africa. Your premier event management platform.",
  url: "https://eventskona.com", 
  ogImage: "https://res.cloudinary.com/dlcl5rqnh/image/upload/v1767946866/eventskona-og-image_treair.jpg", 
  links: {
    twitter: "https://twitter.com/eventskona",
    instagram: "https://instagram.com/eventskona",
    facebook: "https://facebook.com/eventskona",
    linkedin: "https://linkedin.com/company/eventskona"
  },
  keywords: [
    "events in Nigeria",
    "event management",
    "create events online",
    "event ticketing Nigeria",
    "African events",
    "Lagos events",
    "Accra events",
    "Nairobi events",
    "event planning platform",
    "online event registration",
    "event discovery",
    "music events",
    "business conferences",
    "networking events",
    "event organizer",
    "sell event tickets"
  ]
}

export function generateMetadata({
  title,
  description,
  image,
  type = "website",
  noIndex = false,
  keywords
}: {
  title?: string
  description?: string
  image?: string
  type?: "website" | "article"
  noIndex?: boolean
  keywords?: string[]
}): Metadata {
  const metaTitle = title
    ? `${title} | ${siteConfig.name}`
    : `${siteConfig.name} - Discover & Create Events Across Africa`

  const metaDescription = description || siteConfig.description
  const metaImage = image || siteConfig.ogImage
  const metaKeywords = keywords
    ? [...siteConfig.keywords, ...keywords]
    : siteConfig.keywords

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: "EventsKona Team" }],
    creator: "EventsKona",
    publisher: "EventsKona",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: type,
      locale: "en_NG",
      url: siteConfig.url,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: "@eventskona",
      site: "@eventskona",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "your-google-verification-code", // Add after setting up Google Search Console
      // yandex: "your-yandex-verification-code",
      // bing: "your-bing-verification-code",
    },
  }
}

// Event-specific structured data generator
export function generateEventStructuredData(event: {
  name: string
  description: string
  startDate: string
  endDate?: string
  location: {
    name: string
    address?: string
  }
  image?: string
  organizer?: string
  price?: number
  currency?: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate || event.startDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location.name,
      address: event.location.address || event.location.name,
    },
    image: event.image || siteConfig.ogImage,
    organizer: {
      "@type": "Organization",
      name: event.organizer || siteConfig.name,
      url: siteConfig.url,
    },
    ...(event.price && {
      offers: {
        "@type": "Offer",
        price: event.price,
        priceCurrency: event.currency || "NGN",
        availability: "https://schema.org/InStock",
        url: event.url,
        validFrom: new Date().toISOString(),
      },
    }),
  }
}

// Organization structured data
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  legalName: "App Guts",
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/eventskona-logo.png`,
  sameAs: [
    siteConfig.links.twitter,
    siteConfig.links.instagram,
    siteConfig.links.facebook,
    siteConfig.links.linkedin,
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    email: "support@eventskona.com",
    availableLanguage: ["English"],
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "NG",
    addressLocality: "Lagos",
    addressRegion: "Lagos",
    streetAddress: "123 Event Street, Victoria Island",
  },
  parentOrganization: {
    "@type": "Organization",
    name: "App Guts",
  },
}

// Website structured data
export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}
