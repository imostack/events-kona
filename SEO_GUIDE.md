# EventsKona SEO Implementation Guide

## ✅ What's Been Implemented

### 1. **SEO Configuration** (`lib/seo-config.ts`)
- Centralized SEO configuration with reusable metadata generator
- Comprehensive meta tags (title, description, keywords)
- Open Graph tags for social media sharing
- Twitter Card tags
- Structured data generators for events and organization
- Configurable no-index for private pages

### 2. **Root Layout Metadata** (`app/layout.tsx`)
- Global metadata applied to all pages
- Organization structured data (JSON-LD)
- Website structured data with search action
- Proper meta tags for search engines

### 3. **Robots.txt** (`public/robots.txt`)
- Allows all search engines
- Blocks private pages (/api/, /settings, /onboarding)
- Includes sitemap reference
- Crawl delay set to 1 second

### 4. **Dynamic Sitemap** (`app/sitemap.ts`)
- Auto-generated sitemap with all static pages
- Ready to add dynamic event pages
- Proper priorities and change frequencies
- Last modified dates

### 5. **Structured Data**
- Organization schema
- Website schema with search functionality
- Event schema generator (ready for event pages)

---

## 🎯 SEO Action Items

### CRITICAL - Do These First:

#### 1. **Update Your Domain** in `lib/seo-config.ts`
```typescript
url: "https://eventskona.com", // Replace with actual domain
```

#### 2. **Create Open Graph Image**
Create a 1200x630px image for social media sharing:
- Design a professional image with your logo
- Include "EventsKona" text
- Make it visually appealing
- Upload to: `https://alproseltech.com/eventskona-og-image.jpg`
- Update path in `lib/seo-config.ts`

#### 3. **Set Up Google Search Console**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (eventskona.com)
3. Verify ownership
4. Get verification code
5. Add to `lib/seo-config.ts`:
```typescript
verification: {
  google: "your-actual-verification-code",
},
```

#### 4. **Submit Sitemap**
After deploying:
1. Go to Google Search Console
2. Navigate to Sitemaps
3. Submit: `https://eventskona.com/sitemap.xml`

### IMPORTANT - Image Optimization:

#### Update Logo with Alt Text
In `components/navbar.tsx` (line 26):
```tsx
<img
  src="https://alproseltech.com/eventskona-logo.png"
  alt="EventsKona - Event Management Platform Logo"
  className="h-10 w-auto"
  width="160"  // Add actual width
  height="40"  // Add actual height
/>
```

#### Hero Images Already Optimized
- Using Next.js Image component ✅
- Has proper sizing and quality settings ✅
- **TODO:** Add descriptive alt text:
```tsx
alt={`EventsKona hero image ${index + 1} - Discover amazing events across Africa`}
```

### Page-Specific Metadata:

Since most pages are client components ("use client"), metadata must be added differently. Here's how:

#### For Support Pages (Already Clean!)
These pages can have their own metadata if converted to server components. For now, they inherit from root layout.

---

## 📊 SEO Keywords Strategy

### Primary Keywords (Already in config):
- events in Nigeria
- event management
- create events online
- event ticketing Nigeria
- African events

### Location-Based Keywords:
- Lagos events
- Accra events
- Nairobi events
- Port Harcourt events
- Abuja events

### Category Keywords:
- music events Nigeria
- business conferences Lagos
- networking events Africa
- tech meetups Nigeria
- food festivals Lagos

---

## 🔗 Link Building Strategy

### Internal Linking:
1. **Homepage links to:** Create Event, Browse Events, Help Center
2. **Event pages link to:** Organizer profile, Related events, Category pages
3. **Footer links:** All major pages, support pages, legal pages

### External Backlinks (Your Responsibility):
1. **Social Media:**
   - Share events on Twitter/X, Instagram, Facebook, LinkedIn
   - Include website link in all social bios
   - Regular posts with event links

2. **Local Directories:**
   - List on African tech/event directories
   - Register on Nigerian business listings
   - Submit to event aggregator sites

3. **Press & Media:**
   - Reach out to tech blogs (TechCabal, Techpoint Africa)
   - Submit to startup directories
   - Guest posts on event planning blogs

4. **Partnerships:**
   - Partner with event organizers
   - Collaborate with venues
   - Work with ticketing companies

5. **Content Marketing:**
   - Guides page already created
   - Share guides on Medium, LinkedIn
   - Create YouTube content about event planning
   - Newsletter with valuable content

---

## 🎨 Open Graph Image Guidelines

### Specifications:
- **Size:** 1200 x 630 pixels
- **Format:** JPG or PNG
- **Max file size:** 8MB (aim for under 300KB)

### Design Elements:
```
┌─────────────────────────────────────────┐
│                                         │
│         [Your Logo]                     │
│                                         │
│    EventsKona                           │
│    Discover & Create Events             │
│    Across Africa                        │
│                                         │
│    [Eye-catching graphic/pattern]       │
│                                         │
└─────────────────────────────────────────┘
```

### Colors:
- Use your brand colors (primary color from Tailwind config)
- High contrast for readability
- Professional and modern look

---

## 📱 Technical SEO Checklist

### ✅ Completed:
- [x] Meta tags (title, description, keywords)
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] Robots.txt
- [x] Sitemap.xml
- [x] Structured data (Organization, Website)
- [x] Semantic HTML
- [x] Mobile responsive
- [x] Fast loading (Next.js Image optimization)

### 🔲 TODO:
- [ ] Add actual domain to config
- [ ] Create OG image
- [ ] Verify Google Search Console
- [ ] Submit sitemap
- [ ] Add Google Analytics (optional)
- [ ] Set up Google Tag Manager (optional)
- [ ] Create XML sitemap for events (when you have real events)
- [ ] Add breadcrumb structured data
- [ ] Implement canonical URLs for event pages
- [ ] Add FAQ structured data to FAQ page

---

## 🚀 Event Page SEO (When You Have Real Events)

### Each Event Page Should Include:

#### 1. **Metadata**
```typescript
export const metadata = generateMetadata({
  title: event.title,
  description: event.description,
  image: event.imageUrl,
  keywords: [event.category, event.location, 'event'],
})
```

#### 2. **Event Structured Data**
```typescript
<Script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(generateEventStructuredData({
      name: event.title,
      description: event.description,
      startDate: event.date,
      location: {
        name: event.location,
        address: event.fullAddress,
      },
      image: event.imageUrl,
      price: event.price,
      currency: event.currency,
      url: `${siteConfig.url}/event/${event.id}`,
    })),
  }}
/>
```

#### 3. **Semantic HTML**
- Use `<article>` for event content
- Use `<time datetime="">` for dates
- Use proper heading hierarchy (h1, h2, h3)
- Add schema.org microdata attributes

---

## 📈 Monitoring & Analytics

### Google Search Console:
1. Monitor search performance
2. Check indexing status
3. Fix crawl errors
4. Submit new pages

### Key Metrics to Track:
- Organic search traffic
- Click-through rate (CTR)
- Average position in search results
- Impressions
- Page indexing status

### Tools to Use:
- Google Search Console (free)
- Google Analytics (free)
- Bing Webmaster Tools (free)
- Screaming Frog SEO Spider (free tier available)
- PageSpeed Insights (free)

---

## 🎓 Content SEO Best Practices

### For Event Descriptions:
- Minimum 150 words
- Include location keywords
- Mention date and time naturally
- Add event type/category
- Use engaging language
- Include call-to-action

### For Page Content:
- Use descriptive headings
- Write for humans first, search engines second
- Internal linking to related content
- Regular content updates
- Original, valuable content

---

## 🔍 Local SEO for African Markets

### Nigeria-Specific:
- Target "events in Lagos", "events in Abuja"
- Reference Nigerian landmarks
- Use NGN currency
- Mention Nigerian holidays/seasons

### Ghana-Specific:
- Target "events in Accra", "events in Kumasi"
- Use GHS currency
- Reference Ghanaian culture

### Kenya-Specific:
- Target "events in Nairobi", "events in Mombasa"
- Use KES currency
- Reference Kenyan landmarks

---

## ⚡ Performance Optimization (SEO Impact)

### Already Optimized:
- Next.js automatic code splitting
- Image optimization with Next.js Image
- Font optimization with next/font
- Static generation where possible

### Monitor:
- Core Web Vitals (LCP, FID, CLS)
- Page load speed
- Mobile performance
- Server response time

---

## 📞 Next Steps

1. **Immediate (This Week):**
   - Update domain in config
   - Create OG image
   - Set up Google Search Console
   - Verify ownership

2. **Short Term (This Month):**
   - Submit sitemap
   - Start creating backlinks
   - Share on social media
   - Submit to directories

3. **Ongoing:**
   - Create quality content (guides)
   - Build backlinks naturally
   - Monitor performance
   - Optimize based on data

---

## 📚 Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

---

**Remember:** SEO is a long-term strategy. Results typically take 3-6 months to show significantly. Focus on creating valuable content and building quality backlinks!
