import { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo-config'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url

  // Static pages
  const staticPages = [
    '',
    '/help',
    '/contact',
    '/faq',
    '/guides',
    '/privacy',
    '/terms',
    '/cookie-policy',
    '/signup',
    '/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // TODO: Add dynamic event pages when you have real events
  // const events = await getEvents() // Fetch from your API
  // const eventPages = events.map((event) => ({
  //   url: `${baseUrl}/event/${event.id}`,
  //   lastModified: new Date(event.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.7,
  // }))

  return [
    ...staticPages,
    // ...eventPages, // Uncomment when you have dynamic events
  ]
}
